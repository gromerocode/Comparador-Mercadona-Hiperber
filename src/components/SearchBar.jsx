import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ query, onSearchChange, isSearching }) {
  const [localValue, setLocalValue] = useState(query);
  const [isTyping, setIsTyping] = useState(false);

  // Sincroniza el valor local si cambia desde fuera (ej: al hacer click en el historial)
  useEffect(() => {
    setLocalValue(query);
  }, [query]);

  // Implementa el debounce de 400ms
  useEffect(() => {
    if (localValue === query) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      onSearchChange(localValue);
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [localValue, query, onSearchChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ejecuta la búsqueda de forma inmediata al pulsar Enter
    onSearchChange(localValue);
    
    // Quita el foco del input para ocultar el teclado en móviles
    const inputEl = e.target.querySelector('.search-input');
    if (inputEl) {
      inputEl.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-input-wrapper" style={{ width: '100%' }}>
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Busca un producto (ej: leche, patatas, chocolate...)"
      />
      {(isTyping || isSearching) && (
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </form>
  );
}
