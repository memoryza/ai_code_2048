import React, { useState } from 'react';

const Toolbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'about'>('games');

  const toggleToolbox = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-4 w-80">
          <div className="flex mb-4 border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === 'games'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('games')}
            >
              游戏介绍
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('about')}
            >
              关于我
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'games' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">2048</h3>
                  <p className="text-gray-600">
                    2048是一款数字益智游戏。通过上下左右移动，将相同的数字合并。
                    目标是获得2048这个数字。策略性很强，需要仔细规划每一步！
                  </p>
                </div>
                {/* 后续可以在这里添加更多游戏介绍 */}
              </div>
            ) : (
              <div className="text-gray-600">
                <p>
                  这是一个有趣的小游戏集合，包含了多个经典的休闲游戏。
                  希望这些游戏能给你带来欢乐！
                </p>
                <p className="mt-4">
                  项目使用 React + TypeScript 开发，采用现代化的前端技术栈，
                  注重用户体验和代码质量。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <button
        onClick={toggleToolbox}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toolbox;
