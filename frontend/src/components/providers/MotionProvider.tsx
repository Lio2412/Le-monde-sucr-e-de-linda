import { motion, useScroll, useTransform, MotionProps, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionComponents {
  MotionHeader: React.FC<HTMLMotionProps<"header">>;
  MotionGradient: React.FC<HTMLMotionProps<"div">>;
  motion: typeof motion;
}

interface MotionProviderProps {
  children: ReactNode | ((components: MotionComponents) => ReactNode);
}

export default function MotionProvider({ children }: MotionProviderProps) {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const headerY = useTransform(scrollY, [0, 300], [0, 30]);
  const gradientOpacity = useTransform(scrollY, [0, 300], [0.6, 0.8]);

  const MotionHeader: React.FC<HTMLMotionProps<"header">> = ({ className, ...props }) => (
    <motion.header 
      className={className}
      style={{ y: headerY, opacity: headerOpacity }}
      {...props}
    />
  );

  const MotionGradient: React.FC<HTMLMotionProps<"div">> = ({ className, ...props }) => (
    <motion.div
      className={className}
      style={{ opacity: gradientOpacity }}
      {...props}
    />
  );

  const motionComponents: MotionComponents = {
    MotionHeader,
    MotionGradient,
    motion
  };

  return (
    <motion.div>
      {typeof children === 'function' 
        ? children(motionComponents)
        : children}
    </motion.div>
  );
}

export type { MotionProps, MotionComponents }; 