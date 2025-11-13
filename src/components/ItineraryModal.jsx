import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { parseItinerary, hasItineraryContent } from '../utils/itinerary';

const renderSection = (itinerary) => {
  if (!Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        We are preparing a tailored itinerary for your trip.
      </p>
    );
  }

  return itinerary.days.map((day, index) => (
    <div
      key={day.label || `day-${index}`}
      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
    >
      <div>
        <h3 className="text-base font-semibold">
          {day.label || `Day ${index + 1}`}
          {day.theme ? ` • ${day.theme}` : ''}
        </h3>
        {day.date && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {day.date}
          </p>
        )}
      </div>

      {['morning', 'afternoon', 'evening', 'dining'].map((slot) => {
        const items = Array.isArray(day[slot]) ? day[slot] : [];
        if (!items.length) return null;
        return (
          <div key={slot}>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              {slot}
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {items.map((item, itemIdx) => (
                <li key={`${slot}-${itemIdx}`}>{item}</li>
              ))}
            </ul>
          </div>
        );
      })}

      {Array.isArray(day.notes) && day.notes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Notes
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
            {day.notes.map((note, noteIdx) => (
              <li key={`note-${noteIdx}`}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ));
};

const ItineraryModal = ({
  open,
  onClose,
  itinerary,
  generatedAt,
  title = 'Suggested Itinerary'
}) => {
  const parsedItinerary = parseItinerary(itinerary);
  const hasContent = hasItineraryContent(parsedItinerary);

  if (!open || !parsedItinerary || !hasContent) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl"
      >
        <Card className="max-h-[80vh] flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {generatedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Generated on {new Date(generatedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
            {parsedItinerary.overview && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {parsedItinerary.overview}
              </p>
            )}

            <div className="space-y-4">
              {renderSection(parsedItinerary)}
            </div>

            {Array.isArray(parsedItinerary.travelTips) && parsedItinerary.travelTips.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Travel Tips</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  {parsedItinerary.travelTips.map((tip, idx) => (
                    <li key={`tip-${idx}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(parsedItinerary.packingList) && parsedItinerary.packingList.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Packing Checklist</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  {parsedItinerary.packingList.map((item, idx) => (
                    <li key={`pack-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ItineraryModal;


