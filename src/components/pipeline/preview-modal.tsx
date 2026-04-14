"use client";

import { Modal } from "@/components/ui/modal";

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export function PreviewModal({ imageUrl, onClose }: Props) {
  return (
    <Modal open={!!imageUrl} onClose={onClose} className="max-w-5xl">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
      )}
    </Modal>
  );
}
