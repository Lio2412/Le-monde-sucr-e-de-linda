import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { imageSizeConfigs, generateImagePlaceholder } from '@/lib/image-utils';

type ImageVariant = keyof typeof imageSizeConfigs;

interface OptimizedImageProps extends Omit<ImageProps, 'sizes'> {
  variant?: ImageVariant;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  variant = 'hero',
  quality,
  className,
  containerClassName,
  fill,
  width,
  height,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const config = imageSizeConfigs[variant];
  const placeholderColor = generateImagePlaceholder(typeof src === 'string' ? src : '');

  const imageProps = {
    src,
    alt,
    quality: quality || config.quality,
    sizes: config.sizes,
    priority,
    placeholder: "blur" as const,
    blurDataURL: placeholderColor,
    ...props
  };

  if (fill) {
    return (
      <div className={cn("relative", containerClassName)}>
        <Image
          {...imageProps}
          fill
          className={cn("object-cover", className)}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || config.defaultWidth}
      height={height || config.defaultWidth}
      className={className}
    />
  );
} 