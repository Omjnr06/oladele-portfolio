"use client";
import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.92,          
        y: 25,                
        filter: "blur(15px)"  
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        filter: "blur(0px)"   
      }}
      transition={{ 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ willChange: "transform, opacity, filter" }} 
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}