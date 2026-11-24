import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '../i18n';
import DeleteModal from './DeleteModal';
import type { Order } from '../types';

const order: Order = {
  id: 1, title: 'Приход №1', description: '', date: '2017-06-29 12:09:33',
  productCount: 3, total: [],
};

describe('DeleteModal', () => {
  it('renders nothing when no order is passed', () => {
    const { container } = render(<DeleteModal order={null} onCancel={() => {}} onConfirm={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the order title and confirmation, and fires callbacks', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<DeleteModal order={order} onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByText('Приход №1')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Отмена/));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/Удалить/));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
