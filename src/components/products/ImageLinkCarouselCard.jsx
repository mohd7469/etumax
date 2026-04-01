
import React from 'react';
import { motion } from 'framer-motion';

const ImageLinkCarouselCard = ({ item }) => {
  if (!item || !item.image) return null;

  return (
    <a 
      href={item.link || '#'} 
      className="block group w-[220px] flex-shrink-0"
    >
      <motion.div
        whileHover={{ y: -2 }}
        className="compact-card h-[110px] overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 relative bg-gray-50 flex items-center justify-center p-0"
      >
        <img
          src={item.image}
          alt="Carousel Link"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 group-hover:opacity-90"
          loading="lazy"
        />
      </motion.div>
    </a>
  );
};

export default ImageLinkCarouselCard;
