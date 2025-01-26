'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { MessageCircle, Reply, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { LikeButton } from '@/components/ui/like-button';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  recipeId: number;
  comments: Comment[];
}

export default function CommentSection({ recipeId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Utilisateur',
        avatar: '/images/default-avatar.png'
      },
      content: newComment,
      date: new Date().toLocaleDateString('fr-FR'),
      likes: 0,
      isLiked: false
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h2 className={`${playfair.className} text-2xl mb-8`}>Commentaires</h2>

      {/* Formulaire de nouveau commentaire */}
      <motion.form 
        onSubmit={handleSubmitComment} 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-4 items-start">
          <Image
            src="/images/default-avatar.png"
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre avis sur cette recette..."
              className="w-full p-4 border border-gray-200 rounded-lg focus:border-pink-300 focus:ring-1 focus:ring-pink-300 focus:outline-none min-h-[100px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <motion.button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Commenter
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>

      {/* Liste des commentaires */}
      <div className="space-y-8">
        {comments.map(comment => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{comment.author.name}</h3>
                  <span className="text-sm text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-700 mb-4">{comment.content}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <LikeButton
                    commentId={comment.id}
                    initialLikes={comment.likes}
                    isLiked={comment.isLiked}
                    size="sm"
                  />
                  <motion.button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 hover:text-pink-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Reply className="w-4 h-4" />
                    <span>Répondre</span>
                  </motion.button>
                </div>

                {/* Zone de réponse */}
                {replyingTo === comment.id && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <textarea
                      placeholder="Votre réponse..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <motion.button
                        onClick={() => setReplyingTo(null)}
                        className="px-4 py-1 text-sm text-gray-500 hover:text-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        className="px-4 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Répondre
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Réponses */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                    {comment.replies.map(reply => (
                      <motion.div 
                        key={reply.id} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Image
                          src={reply.author.avatar}
                          alt={reply.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{reply.author.name}</span>
                            <span className="text-sm text-gray-500">{reply.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                          <LikeButton
                            commentId={reply.id}
                            initialLikes={reply.likes}
                            isLiked={reply.isLiked}
                            size="sm"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 