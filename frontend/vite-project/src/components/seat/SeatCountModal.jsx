import React from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

const VEHICLES = [
  { count: 1, label: 'Cycle' },
  { count: 2, label: 'Scooter' },
  { count: 3, label: 'Auto' },
  { count: 4, label: 'Car' },
  { count: 5, label: 'SUV' },
  { count: 6, label: 'Minibus' },
];

export const SeatCountModal = ({
  isOpen,
  onClose,
  currentCount = 2,
  onSelectCount,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How Many Seats?"
      maxWidth="max-w-md"
      showCloseButton={true}
    >
      <div className="py-2 space-y-6 text-center">
        {/* Seat Count Options 1 to 6 */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isSelected = num === currentCount;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onSelectCount(num)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center font-bold text-sm sm:text-base transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-md scale-105 ring-2 ring-primary/30'
                    : 'bg-gray-100 hover:bg-gray-200 text-ink'
                }`}
                aria-label={`${num} tickets`}
                aria-pressed={isSelected}
              >
                <span>{num}</span>
              </button>
            );
          })}
        </div>

        {/* Selected vehicle descriptor */}
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          {VEHICLES.find((v) => v.count === currentCount)?.label || 'Tickets'}
        </p>

        {/* Confirm Selection CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full font-bold"
          onClick={onClose}
        >
          Select Seats
        </Button>
      </div>
    </Modal>
  );
};

export default SeatCountModal;
