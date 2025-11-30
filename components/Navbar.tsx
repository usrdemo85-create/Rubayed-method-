import React from 'react';

const Navbar: React.FC<{ active: string }> = ({ active }) => {
  const icons = [
    { id: 'home', char: '⌂' },
    { id: 'heart', char: '♥' },
    { id: 'stats', char: '📊' },
  ];

  return (
    <div className="fixed bottom-0 w-full h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center z-20 pb-safe">
      {icons.map((item) => (
        <button
          key={item.id}
          className={`text-3xl transition-all ${
            active === item.id ? 'text-yellow-500 scale-110' : 'text-slate-600'
          }`}
        >
          {item.char}
        </button>
      ))}
    </div>
  );
};

export default Navbar;
