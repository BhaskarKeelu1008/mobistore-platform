import Product from '../models/Product';
import InventoryLog from '../models/InventoryLog';

export const deductStock = async (
  productId: string,
  quantity: number,
  variantSku: string | undefined,
  userId: string,
  reference: string
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) throw new Error('Variant not found');
    if (variant.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
    const previousStock = variant.stock;
    variant.stock -= quantity;
    product.totalStock -= quantity;
    await product.save();
    await InventoryLog.create({
      product: productId,
      variantSku,
      type: 'sale',
      quantity: -quantity,
      previousStock,
      newStock: variant.stock,
      reference,
      createdBy: userId,
    });
  } else {
    if (product.totalStock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
    const previousStock = product.totalStock;
    product.totalStock -= quantity;
    if (product.variants.length > 0) {
      product.variants[0].stock -= quantity;
    }
    await product.save();
    await InventoryLog.create({
      product: productId,
      type: 'sale',
      quantity: -quantity,
      previousStock,
      newStock: product.totalStock,
      reference,
      createdBy: userId,
    });
  }
};

export const addStock = async (
  productId: string,
  quantity: number,
  variantSku: string | undefined,
  userId: string,
  type: 'purchase' | 'return' | 'adjustment',
  supplierId?: string,
  notes?: string
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  let previousStock = product.totalStock;

  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) throw new Error('Variant not found');
    previousStock = variant.stock;
    variant.stock += quantity;
    product.totalStock += quantity;
  } else {
    product.totalStock += quantity;
    if (product.variants.length > 0) {
      product.variants[0].stock += quantity;
    }
  }

  await product.save();
  await InventoryLog.create({
    product: productId,
    variantSku,
    type,
    quantity,
    previousStock,
    newStock: variantSku
      ? product.variants.find((v) => v.sku === variantSku)!.stock
      : product.totalStock,
    supplier: supplierId,
    notes,
    createdBy: userId,
  });

  return product;
};

export const getLowStockProducts = async (threshold = 10) => {
  return Product.find({
    isActive: true,
    totalStock: { $lte: threshold },
  }).populate('category brand');
};
