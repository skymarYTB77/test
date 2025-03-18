import React, { useState, useRef, useEffect } from 'react';
import { Flame, Snowflake, ThermometerSun } from 'lucide-react';

interface ClassificationProps {
  value: string;
  onChange: (value: string) => void;
}

export function Classification({ value, onChange }: ClassificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'Chaud', icon: Flame, color: '#ff4d4d' },
    { value: 'Tiede', icon: ThermometerSun, color: '#ffa726' },
    { value: 'Froid', icon: Snowflake, color: '#2196f3' }
  ];

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="classification-container" ref={containerRef} onClick={() => setIsOpen(!isOpen)}>
      <div className="classification-value">
        {value || '-'}
      </div>
      {isOpen && (
        <div 
          className="classification-options"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          {options.map(option => (
            <button
              key={option.value}
              className="classification-option"
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{ '--option-color': option.color } as React.CSSProperties}
            >
              <option.icon size={16} />
              <span>{option.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}