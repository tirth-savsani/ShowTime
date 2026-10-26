import {
  generateSeats,
  generateSeatIds,
  calculateTotalSeats,
  extractCategories,
} from '../services/seatLayout.service.js';
import { createScreenSchema } from '../validators/screen.validator.js';
import mongoose from 'mongoose';

describe('Seat Layout Service (Spec B6.1 & B10)', () => {
  const sampleLayout = {
    rows: [
      {
        label: 'A',
        seatCount: 4,
        category: 'PLATINUM',
        aisleAfter: [2],
      },
      {
        label: 'B',
        seatCount: 6,
        category: 'GOLD',
        aisleAfter: [3],
      },
    ],
  };

  it('generates seat objects with ids, rows, numbers, categories, and aisle flags in order', () => {
    const seats = generateSeats(sampleLayout);

    expect(seats).toHaveLength(10);

    // Row A
    expect(seats[0]).toEqual({
      id: 'A1',
      row: 'A',
      number: 1,
      category: 'PLATINUM',
      aisleAfter: false,
    });
    expect(seats[1]).toEqual({
      id: 'A2',
      row: 'A',
      number: 2,
      category: 'PLATINUM',
      aisleAfter: true,
    });
    expect(seats[2]).toEqual({
      id: 'A3',
      row: 'A',
      number: 3,
      category: 'PLATINUM',
      aisleAfter: false,
    });
    expect(seats[3]).toEqual({
      id: 'A4',
      row: 'A',
      number: 4,
      category: 'PLATINUM',
      aisleAfter: false,
    });

    // Row B
    expect(seats[4]).toEqual({
      id: 'B1',
      row: 'B',
      number: 1,
      category: 'GOLD',
      aisleAfter: false,
    });
    expect(seats[6]).toEqual({
      id: 'B3',
      row: 'B',
      number: 3,
      category: 'GOLD',
      aisleAfter: true,
    });
    expect(seats[9]).toEqual({
      id: 'B6',
      row: 'B',
      number: 6,
      category: 'GOLD',
      aisleAfter: false,
    });
  });

  it('generateSeatIds alias returns identical result to generateSeats', () => {
    expect(generateSeatIds(sampleLayout)).toEqual(generateSeats(sampleLayout));
  });

  it('calculateTotalSeats calculates the exact sum of all seatCounts', () => {
    expect(calculateTotalSeats(sampleLayout)).toBe(10);
  });

  it('extractCategories returns unique category names present in layout', () => {
    expect(extractCategories(sampleLayout)).toEqual(['PLATINUM', 'GOLD']);
  });

  describe('Layout Validation Rules', () => {
    const validTheatreId = new mongoose.Types.ObjectId().toString();

    it('validates a correct screen layout', async () => {
      const validPayload = {
        body: {
          theatre: validTheatreId,
          name: 'Audi 1',
          layout: sampleLayout,
        },
      };

      await expect(createScreenSchema.parseAsync(validPayload)).resolves.toBeDefined();
    });

    it('rejects duplicate row labels', async () => {
      const duplicateLabelPayload = {
        body: {
          theatre: validTheatreId,
          name: 'Audi 1',
          layout: {
            rows: [
              { label: 'A', seatCount: 5, category: 'GOLD', aisleAfter: [] },
              { label: 'A', seatCount: 5, category: 'SILVER', aisleAfter: [] },
            ],
          },
        },
      };

      await expect(createScreenSchema.parseAsync(duplicateLabelPayload)).rejects.toThrow();
    });

    it('rejects aisleAfter number greater than or equal to seatCount', async () => {
      const invalidAislePayload = {
        body: {
          theatre: validTheatreId,
          name: 'Audi 1',
          layout: {
            rows: [
              { label: 'A', seatCount: 5, category: 'GOLD', aisleAfter: [5] }, // 5 >= 5 (must be < 5)
            ],
          },
        },
      };

      await expect(createScreenSchema.parseAsync(invalidAislePayload)).rejects.toThrow();
    });

    it('rejects seatCount greater than 30', async () => {
      const overflowSeatPayload = {
        body: {
          theatre: validTheatreId,
          name: 'Audi 1',
          layout: {
            rows: [
              { label: 'A', seatCount: 31, category: 'GOLD', aisleAfter: [] },
            ],
          },
        },
      };

      await expect(createScreenSchema.parseAsync(overflowSeatPayload)).rejects.toThrow();
    });
  });
});
