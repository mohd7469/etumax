
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useWhatsApp } from "@/context/WhatsAppContext";
import { useProducts } from "@/context/ProductContext";

const WhatsAppButton = () => {
  const { settings } = useWhatsApp();
  const { getProductBySlug, formatPrice, products } = useProducts();
  const location = useLocation();
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const isVisible = true;

  const shortenUrl = (url, max = 35) => {
    if (!url) return "";
    return url.length > max ? url.substring(0, max) + "..." : url;
  };

  useEffect(() => {
    let slug = params.slug;

    if (!slug && location.pathname.includes("/product/")) {
      slug = location.pathname.split("/product/")[1]?.split("/")[0];
    }

    if (!slug) return setProduct(null);

    let found = getProductBySlug?.(slug);

    if (!found && products?.length) {
      found = products.find((p) => p.slug === slug);
    }

    setProduct(found || null);
  }, [location.pathname, params.slug, getProductBySlug, products]);

  const autoMessage = () => {
    let msg = settings?.defaultMessage || "";

    const title = product?.name || "";
    const price = product?.price ? formatPrice(product.price) : "";
    const url = window.location.href;

    msg = msg.replace(/\[TITLE\]/gi, title);
    msg = msg.replace(/\[PRICE\]/gi, price);
    msg = msg.replace(/\[URL\]/gi, url);

    return msg;
  };

  useEffect(() => {
    const t = setTimeout(() => setPopupOpen(true), 555000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!popupOpen) return;
      const popup = document.getElementById("wa-popup");
      const buttonDesktop = document.getElementById("wa-button-desktop");

      if (
        popup && 
        !popup.contains(e.target) && 
        (!buttonDesktop || !buttonDesktop.contains(e.target))
      ) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [popupOpen]);

  const openChat = () => {
    const encoded = encodeURIComponent(autoMessage());
    const url = `https://wa.me/${settings.phoneNumber}?text=${encoded}`;
    window.open(url, "_blank");
  };

  if (!isVisible) return null;

  const side = settings?.position === "left" ? "left" : "right";
  const buttonPosition = { [side]: "1.25rem" };
  const popupPosition = { [side]: "1.25rem" };

  return (
    <>
      {/* DESKTOP BUTTON ONLY - Mobile moved to MobileBottomNav */}
      <button
        id="wa-button-desktop"
        onClick={() => setPopupOpen(true)}
        style={{
          position: "fixed",
          bottom: "5rem",
          width: "56px",
          height: "56px",
          ...buttonPosition
        }}
        className="hidden md:flex relative items-center justify-center bg-[#25D366] rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] z-[99999]"
      >
        <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></span>
        <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></span>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          className="w-8 h-8 relative z-10"
          alt="WhatsApp"
        />
      </button>

      {/* POPUP */}
      {popupOpen && (
        <div
          id="wa-popup"
          style={{
            position: "fixed",
            bottom: "7rem",
            width: "20rem",
            zIndex: 99999,
            ...popupPosition
          }}
          className="bg-white rounded-xl shadow-xl border border-gray-200"
        >
          <div className="p-4 bg-green-700 text-white rounded-t-xl flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
                alt="WhatsApp Support"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Support</p>
              <p className="text-xs opacity-80">Typically replies within 2 minutes</p>
            </div>
            <button onClick={() => setPopupOpen(false)} className="text-white text-xl">
              ✕
            </button>
          </div>

          {product && (
            <div className="p-3 bg-white flex space-x-3 border-b">
              <img
                src={product.mainImage || product.images?.[0]}
                className="w-20 h-20 rounded-lg object-cover"
                alt={product.name}
              />
              <div>
                <p className="font-semibold text-gray-800">{product.name}</p>
                <p className="font-bold text-purple-600">{formatPrice(product.price)}</p>
              </div>
            </div>
          )}

          <div className="p-3">
            <p className="bg-gray-100 p-3 rounded-md text-sm text-gray-700 whitespace-pre-wrap break-all">
              {autoMessage().replace(window.location.href, shortenUrl(window.location.href))}
            </p>
          </div>

          <div className="p-3">
            <button
              onClick={openChat}
              className="w-full py-3 bg-green-500 text-white rounded-full text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <span>Open chat</span>
              <span className="text-xl">➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
