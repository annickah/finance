import React from 'react';
import { InvoiceFormModal } from './InvoiceFormModal';
import { Invoice } from '../../types';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  preselectedProjectId?: string;
  onSubmit?: (invoice: any) => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = (props) => {
  return <InvoiceFormModal {...props} />;
};
