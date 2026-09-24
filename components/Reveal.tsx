"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds, useful when several Reveals sit in a row/grid */
  delay?: number;
  /** Direction the content travels in from */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Distance in px content travels */
  distance?: number;
};

const offsets: Record<NonNullable<RevealProps["direction"]>, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 48,
}) => {
  const offset = offsets[direction];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.94,
      x: offset.x ? offset.x * distance : 0,
      y: offset.y ? offset.y * distance : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
