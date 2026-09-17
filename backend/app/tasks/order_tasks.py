import asyncio
import uuid
import logging
from celery import shared_task
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.config import settings
from app.models.order import Order, OrderStatus, PaymentLog
from app.models.product import Product, InventoryLog

logger = logging.getLogger(__name__)

async def _process_order_checkout_async(order_id: int):
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        async with session.begin():
            # 1. Fetch Order with items
            result = await session.execute(
                select(Order).where(Order.id == order_id)
            )
            order = result.scalar_one_or_none()
            if not order:
                logger.error(f"Order #{order_id} not found in database")
                return

            if order.status != OrderStatus.PENDING:
                logger.info(f"Order #{order_id} is already in state {order.status}")
                return

            order.status = OrderStatus.PROCESSING
            await session.flush()

            # 2. Check & deduct stock for each item
            insufficient_stock = False
            for item in order.items:
                prod_result = await session.execute(
                    select(Product).where(Product.id == item.product_id).with_for_update()
                )
                product = prod_result.scalar_one_or_none()
                if not product or product.stock_quantity < item.quantity:
                    insufficient_stock = True
                    logger.warning(
                        f"Insufficient stock for Product #{item.product_id} (Requested: {item.quantity}, Available: {product.stock_quantity if product else 0})"
                    )
                    break
                
                # Deduct stock and write audit log
                prev_stock = product.stock_quantity
                product.stock_quantity -= item.quantity
                log_entry = InventoryLog(
                    product_id=product.id,
                    change_amount=-item.quantity,
                    previous_stock=prev_stock,
                    new_stock=product.stock_quantity,
                    reason=f"Order #{order.id} Checkout Deduction"
                )
                session.add(log_entry)

            if insufficient_stock:
                order.status = OrderStatus.FAILED
                payment = PaymentLog(
                    order_id=order.id,
                    amount=order.total_amount,
                    status="FAILED_INSUFFICIENT_STOCK",
                    transaction_id=f"TXN-FAILED-{uuid.uuid4().hex[:8].upper()}"
                )
                session.add(payment)
                await session.commit()
                return

            # 3. Simulate Payment Processing Gateway
            payment_txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            payment_success = True  # Simulated high-reliability payment gateway

            if payment_success:
                order.status = OrderStatus.COMPLETED
                payment = PaymentLog(
                    order_id=order.id,
                    amount=order.total_amount,
                    status="SUCCESS",
                    transaction_id=payment_txn_id
                )
                session.add(payment)
            else:
                order.status = OrderStatus.FAILED
                payment = PaymentLog(
                    order_id=order.id,
                    amount=order.total_amount,
                    status="FAILED_PAYMENT_DECLINED",
                    transaction_id=payment_txn_id
                )
                session.add(payment)

            await session.commit()
            logger.info(f"Order #{order_id} successfully processed with status {order.status}")

    await engine.dispose()

@shared_task(bind=True, name="app.tasks.order_tasks.process_order_checkout")
def process_order_checkout(self, order_id: int):
    """
    Celery task wrapper to execute async order processing pipeline.
    """
    logger.info(f"[Celery Worker] Starting task process_order_checkout for Order ID #{order_id}")
    try:
        asyncio.run(_process_order_checkout_async(order_id))
        return {"status": "SUCCESS", "order_id": order_id}
    except Exception as exc:
        logger.error(f"[Celery Worker] Error processing order #{order_id}: {exc}")
        raise exc
