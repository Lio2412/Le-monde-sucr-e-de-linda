'use client';

import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Image from '@editorjs/image';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Entrez un titre',
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true
          },
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: '/api/upload/image',
                byUrl: '/api/fetch-url'
              }
            }
          }
        },
        data: value ? JSON.parse(value) : {},
        onChange: async () => {
          const content = await editorRef.current?.save();
          onChange(JSON.stringify(content));
        },
        placeholder: 'Commencez à écrire votre contenu...'
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="prose max-w-none">
      <div id="editor" className="min-h-[300px]" />
    </div>
  );
} 