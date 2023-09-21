import { UniqueIdentifier } from '@dnd-kit/core';

export default interface ContainerProps {
  id: UniqueIdentifier;
  tasks: any;
  title?: string;
  description?: string;
  onAddItem?: () => void;
  handleRemove: any
}
