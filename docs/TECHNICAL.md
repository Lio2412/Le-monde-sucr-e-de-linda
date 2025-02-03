## Animations des Réactions

### Implémentation
Les animations des réactions sont gérées via Framer Motion pour assurer une expérience utilisateur fluide et agréable.

#### Menu des Réactions
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8, y: 10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.8, y: 10 }}
  transition={{ duration: 0.2 }}
>
```

#### Badges de Réaction
```tsx
<motion.button
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  layout
>
```

### Propriétés d'Animation
- `initial`: État initial de l'élément
- `animate`: État final de l'animation
- `exit`: État lors de la suppression
- `whileHover`: Animation au survol
- `whileTap`: Animation au clic
- `layout`: Animation automatique lors des changements de position

### Performance
Les animations sont optimisées pour minimiser l'impact sur les performances :
- Utilisation de la propriété `layout` pour les animations de position
- Transitions courtes (200-300ms)
- Animations légères basées sur opacity et scale 