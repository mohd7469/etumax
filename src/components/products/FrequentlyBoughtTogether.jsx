import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useDesign } from '@/context/DesignContext';
import { useCoupon } from '@/context/CouponContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Tag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import PriceDisplay from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const FORCED_BUNDLE_COUPON_CODE = 'BUNDLE-OFFER';

const FrequentlyBoughtTogether = ({
	currentProduct,
	bundleSettings: propBundleSettings,
	navigateTo
}) => {
	const { getRelatedProductsForBundle, formatPrice } = useProducts();
	const { addToCart, applyCoupon } = useCart();
	const { bundleSettings: contextBundleSettings } = useDesign();
	const { getCouponByCode } = useCoupon();

	const bundleSettings = propBundleSettings || contextBundleSettings;

	const [relatedProducts, setRelatedProducts] = useState([]);
	const [selectedIds, setSelectedIds] = useState([]);
	const [timeLeft, setTimeLeft] = useState(bundleSettings?.expirationMinutes * 60 || 3600);
	const [isProcessing, setIsProcessing] = useState(false);

	const forcedCouponDetails = useMemo(() => {
		try {
			return getCouponByCode?.(FORCED_BUNDLE_COUPON_CODE) || null;
		} catch (e) {
			return null;
		}
	}, [getCouponByCode]);

	useEffect(() => {
		if (currentProduct && bundleSettings?.enabled) {
			const products = getRelatedProductsForBundle(
				currentProduct,
				bundleSettings.maxProducts,
				bundleSettings.selectionMode,
				bundleSettings.manualProductIds
			);

			setRelatedProducts(products);
			setSelectedIds(products.map((p) => p.id));
		}
	}, [currentProduct, bundleSettings, getRelatedProductsForBundle]);

	useEffect(() => {
		if (!bundleSettings?.enabled || timeLeft <= 0) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, bundleSettings?.enabled]);

	if (!bundleSettings?.enabled || relatedProducts.length === 0) {
		return null;
	}

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	};

	const handleToggleSelection = (id) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const activeProducts = relatedProducts.filter((p) => selectedIds.includes(p.id));
	const allSelectedProducts = [currentProduct, ...activeProducts];

	const baseTotal = allSelectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);

	const isBundleActive = activeProducts.length > 0;

	const discountAmount = isBundleActive
		? baseTotal * ((bundleSettings?.discountPercentage || 0) / 100)
		: 0;

	const finalTotal = baseTotal - discountAmount;

	const applyForcedCoupon = () => {
		if (!isBundleActive) return;

		try {
			applyCoupon(FORCED_BUNDLE_COUPON_CODE, null, true);
		} catch (err) {
			console.error('[FBT] applyCoupon failed:', err);
		}
	};

	const handleAddSelected = () => {
		if (allSelectedProducts.length === 0) return;

		setIsProcessing(true);

		allSelectedProducts.forEach((p) => addToCart(p, 1));
		applyForcedCoupon();

		toast({
			title: 'Added to Cart!',
			description: `${allSelectedProducts.length} items have been added to your cart.`
		});

		setIsProcessing(false);
	};

	const handleBuyBundleNow = () => {
		if (allSelectedProducts.length === 0) return;

		setIsProcessing(true);

		allSelectedProducts.forEach((p) => addToCart(p, 1));
		applyForcedCoupon();

		setTimeout(() => {
			setIsProcessing(false);
			navigateTo?.('checkout');
		}, 600);
	};

	return (
		<div className="bg-white border rounded-xl overflow-hidden shadow-sm mt-6">
			<div className="bg-red-50 text-red-600 p-3 flex items-center justify-center gap-2 border-b border-red-100">
				<Clock className="w-4 h-4" />
				<span className="text-sm font-semibold uppercase tracking-wider">
					Bundle deal ends in: {formatTime(timeLeft)}
				</span>
			</div>

			<div className="p-5 space-y-4">
				<h3 className="font-bold text-lg text-gray-900">Frequently Bought Together</h3>

				<div className="space-y-3">
					<div className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
						<Checkbox checked={true} disabled className="mt-1" />
						<div className="w-12 h-12 bg-white rounded border flex-shrink-0 overflow-hidden">
							<ProductImage src={currentProduct?.mainImage} alt={currentProduct?.name} aspectRatio="square" className="w-full h-full object-cover" lazy={true} />
						</div>
						<div className="flex-1 min-w-0">
							<Link
								to={`/product/${currentProduct?.slug || currentProduct?.id}`}
								className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-primary hover:underline cursor-pointer"
								onClick={(e) => e.stopPropagation()}
							>
								{currentProduct?.name}
							</Link>
							<div className="mt-1">
                <PriceDisplay product={currentProduct} size="sm" />
              </div>
						</div>
					</div>

					{relatedProducts.map((product) => (
						<div
							key={product.id}
							className={cn(
								"flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer border",
								selectedIds.includes(product.id)
									? "bg-white border-primary/20"
									: "bg-white border-transparent hover:bg-gray-50"
							)}
							onClick={() => handleToggleSelection(product.id)}
						>
							<Checkbox
								checked={selectedIds.includes(product.id)}
								onCheckedChange={() => handleToggleSelection(product.id)}
								className="mt-1"
								onClick={(e) => e.stopPropagation()}
							/>
							<div className="w-12 h-12 bg-gray-50 rounded border flex-shrink-0 overflow-hidden">
								<ProductImage src={product.mainImage} alt={product.name} aspectRatio="square" className="w-full h-full object-cover" lazy={true} />
							</div>
							<div className="flex-1 min-w-0">
								<Link
									to={`/product/${product.slug || product.id}`}
									className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-primary hover:underline cursor-pointer"
									onClick={(e) => e.stopPropagation()}
								>
									{product.name}
								</Link>
                <div className="mt-1">
                  <PriceDisplay product={product} size="sm" />
                </div>
							</div>
						</div>
					))}
				</div>

				<div className="pt-4 border-t space-y-2">
					<div className="flex justify-between text-sm text-gray-500">
						<span>Subtotal:</span>
						<span>{formatPrice(baseTotal)}</span>
					</div>

					{isBundleActive && (
						<div className="flex justify-between text-sm font-medium text-green-600">
							<span>Bundle Discount ({bundleSettings?.discountPercentage || 0}%):</span>
							<span>-{formatPrice(discountAmount)}</span>
						</div>
					)}

					<div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
						<span>Total Price:</span>
						<span className="text-black">{formatPrice(finalTotal)}</span>
					</div>

					{isBundleActive && (
  <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm font-medium flex items-center border border-purple-100 mt-2">
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Tag className="w-4 h-4 shrink-0" />
      
      <p className="truncate">
        Coupon{" "}
        <span className="font-bold">{FORCED_BUNDLE_COUPON_CODE}</span>{" "}
        will be auto-applied!
      </p>
    </div>

    {/* RIGHT SIDE */}
    {forcedCouponDetails?.discountPercentage && (
      <div className="ml-3 shrink-0 text-xs font-semibold opacity-80 whitespace-nowrap">
        ({forcedCouponDetails.discountPercentage}% OFF)
      </div>
    )}

  </div>
)}
				</div>

				<div className="pt-2 space-y-2">
					<Button
						onClick={handleAddSelected}
						variant="outline"
						className="w-full h-11 border-primary text-primary hover:bg-primary/5"
						disabled={allSelectedProducts.length === 0 || isProcessing}
					>
						{isProcessing ? (
							<span className="flex items-center">
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Adding...
							</span>
						) : (
							'Add Selected to Cart'
						)}
					</Button>

					<Button
						onClick={handleBuyBundleNow}
						className="w-full h-11 bg-primary hover:bg-primary/90 text-white"
						disabled={allSelectedProducts.length === 0 || isProcessing}
					>
						{isProcessing ? (
							<span className="flex items-center">
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
							</span>
						) : (
							'Buy Bundle Now'
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FrequentlyBoughtTogether;