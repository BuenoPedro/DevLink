import React, { useState } from 'react';
import { FiHeart, FiMessageCircle, FiUserPlus, FiUserCheck } from 'react-icons/fi';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleFollow = () => setIsFollowing(!isFollowing);

  return (
    <div className="card">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={post.companyImage || '/placeholder.svg'} alt={post.company} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{post.company}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{post.followers} seguidores</p>
            </div>
          </div>

          {/* Botão seguir */}
          <button
            onClick={handleFollow}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
          >
            {isFollowing ? (
              <>
                <FiUserCheck size={16} />
                <span>Seguindo</span>
              </>
            ) : (
              <>
                <FiUserPlus size={16} />
                <span>Seguir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <p className="text-gray-800 dark:text-gray-100 leading-relaxed mb-4">{post.content}</p>

        {post.image && (
          <div className="mb-4">
            <img src={post.image || '/placeholder.svg'} alt="Post content" className="w-full h-64 object-cover rounded-lg" />
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors
            ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
          >
            <FiHeart size={20} className={isLiked ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-500 hover:text-sky-500 transition-colors dark:text-gray-400 dark:hover:text-sky-400">
            <FiMessageCircle size={20} />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
