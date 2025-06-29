import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Smile, Heart, ThumbsUp } from 'lucide-react';
import Input from '../ui/Input';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('recent');

  const emojiCategories = {
    recent: {
      icon: Clock,
      emojis: ['😊', '❤️', '👍', '😂', '🥰', '😘', '🤗', '😍']
    },
    smileys: {
      icon: Smile,
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
        '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨'
      ]
    },
    hearts: {
      icon: Heart,
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
        '💘', '💝', '💟', '♥️', '💌', '💋', '💍', '💎'
      ]
    },
    gestures: {
      icon: ThumbsUp,
      emojis: [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
        '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚',
        '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'
      ]
    }
  };

  const filteredEmojis = searchQuery
    ? Object.values(emojiCategories)
        .flatMap(cat => cat.emojis)
        .filter(emoji => 
          // Simple emoji search - in a real app, you'd have emoji names/keywords
          emoji.includes(searchQuery)
        )
    : emojiCategories[activeCategory as keyof typeof emojiCategories]?.emojis || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
    >
      {/* Search */}
      <div className="mb-3">
        <Input
          type="text"
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="text-sm"
        />
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex space-x-1 mb-3 border-b border-gray-100 pb-2">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`p-2 rounded-lg transition-colors ${
                activeCategory === key
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <category.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {filteredEmojis.length === 0 && searchQuery && (
        <div className="text-center py-4 text-gray-500">
          No emojis found for "{searchQuery}"
        </div>
      )}

      {/* Close overlay */}
      <div
        className="fixed inset-0 z-[-1]"
        onClick={onClose}
      />
    </motion.div>
  );
};

export default EmojiPicker;