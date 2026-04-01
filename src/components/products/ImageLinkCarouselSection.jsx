import React from 'react';
import { motion } from 'framer-motion';
import ImageLinkCarousel from './ImageLinkCarousel';

const ImageLinkCarouselSection = ({ sectionSettings, carouselWidth = '110%' }) => {
  if (!sectionSettings?.show || !sectionSettings.items?.length) return null;

  return (
    <section className="container mx-auto px-4 py-2">
      {sectionSettings.title && (
        <div className="carousel-container mb-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{sectionSettings.title}</h2>
          </motion.div>
        </div>
      )}
      
      <ImageLinkCarousel 
        items={sectionSettings.items} 
        speed={sectionSettings.speed || 30}
        carouselWidth={carouselWidth}
      />
    </section>
  );
};

export default ImageLinkCarouselSection;