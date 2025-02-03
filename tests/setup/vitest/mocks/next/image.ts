export default function Image(props: any) {
  return `<img ${Object.keys(props).map(key => `${key}="${props[key]}"`).join(' ')} alt="${props.alt || ''}" />`;
}
