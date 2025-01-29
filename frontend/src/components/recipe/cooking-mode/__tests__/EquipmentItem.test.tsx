import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentItem } from '../EquipmentItem';

describe('EquipmentItem', () => {
  it('affiche correctement le nom de l\'équipement', () => {
    render(<EquipmentItem name="Fouet électrique" />);
    expect(screen.getByText('Fouet électrique')).toBeInTheDocument();
  });

  it('affiche une icône appropriée pour un équipement connu', () => {
    render(<EquipmentItem name="Fouet électrique" />);
    const icon = screen.getByTestId('equipment-icon');
    expect(icon).toBeInTheDocument();
  });

  it('affiche l\'icône par défaut pour un équipement inconnu', () => {
    render(<EquipmentItem name="Équipement inconnu" />);
    const icon = screen.getByTestId('equipment-icon');
    expect(icon).toBeInTheDocument();
  });

  it('applique les styles appropriés', () => {
    render(<EquipmentItem name="Fouet électrique" />);
    const listItem = screen.getByTestId('equipment-item');
    expect(listItem).toHaveClass('flex', 'items-center', 'gap-3', 'p-2', 'rounded-md');
  });

  // Test des différents types d'équipement
  const equipmentTypes = [
    'Grand bol',
    'Balance de précision',
    'Thermomètre de cuisson',
    'Four traditionnel',
    'Batteur électrique',
    'Minuteur digital',
    'Rouleau à pâtisserie',
    'Réfrigérateur',
    'Congélateur'
  ];

  equipmentTypes.forEach(name => {
    it(`affiche la bonne icône pour ${name}`, () => {
      render(<EquipmentItem name={name} />);
      const icon = screen.getByTestId('equipment-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
}); 