import Image from 'next/image';
import { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { imageSizeConfigs, generateImagePlaceholder, type ImageVariant } from '@/lib/image-utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'sizes'> {
  variant: ImageVariant;
  containerClassName?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  variant,
  quality = imageSizeConfigs[variant].quality,
  className,
  containerClassName,
  priority = imageSizeConfigs[variant].priority,
  ...props
}: OptimizedImageProps) {
  const config = imageSizeConfigs[variant];
  const placeholderColor = generateImagePlaceholder(typeof src === 'string' ? src : '');

  const imageProps: ImageProps = {
    src,
    alt,
    quality: quality || config.quality,
    sizes: config.sizes,
    priority: priority ?? config.priority,
    placeholder: "blur" as const,
    blurDataURL: `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${encodeURIComponent(placeholderColor)}'/></svg>`,
    ...props
  };

  return (
    <div className={containerClassName}>
      <Image
        {...imageProps}
        className={cn(
          'transition-all duration-300',
          className
        )}
      />
    </div>
  );
} 