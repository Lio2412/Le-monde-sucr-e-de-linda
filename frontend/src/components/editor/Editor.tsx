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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initEditor = async () => {
      if (!containerRef.current) return;

      // Détruire l'instance précédente si elle existe
      if (editorRef.current) {
        try {
          await editorRef.current.isReady;
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (e) {
          console.error('Erreur lors de la destruction de l\'éditeur:', e);
        }
      }

      try {
        const editor = new EditorJS({
          holder: containerRef.current,
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
            const content = await editor.save();
            onChange(JSON.stringify(content));
          },
          placeholder: 'Commencez à écrire votre contenu...'
        });

        await editor.isReady;
        editorRef.current = editor;
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'éditeur:', error);
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (e) {
          console.error('Erreur lors du nettoyage de l\'éditeur:', e);
        }
      }
    };
  }, [value]); // Réinitialiser l'éditeur quand la valeur change

  return (
    <div className="prose max-w-none">
      <div ref={containerRef} className="min-h-[300px]" />
    </div>
  );
} 