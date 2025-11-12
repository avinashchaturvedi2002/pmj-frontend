import { useEffect, useMemo, useState } from 'react';
import { hotelService } from '../services';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { AlertCircle, BedDouble, Clock, RefreshCw, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const DEFAULT_HOLD_DURATION_SECONDS = 300;

const getPayloadData = (response) => {
  if (!response) return {};
  if (response.data?.data) return response.data.data;
  if (response.data) return response.data;
  return response;
};

const HotelRoomPicker = ({
  hotelId,
  tripId,
  checkIn,
  checkOut,
  roomsNeeded = 1,
  selection = {},
  onSelectionChange,
  className
}) => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [holdTimer, setHoldTimer] = useState(DEFAULT_HOLD_DURATION_SECONDS);

  const holdToken = selection?.holdToken || null;
  const selectedRooms = selection?.roomNumbers || [];
  const expiresAt = selection?.expiresAt ? new Date(selection.expiresAt) : null;

  const roomsRequired = Math.max(1, roomsNeeded || 1);

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, tripId, checkIn, checkOut]);

  useEffect(() => {
    if (!expiresAt) {
      setHoldTimer(DEFAULT_HOLD_DURATION_SECONDS);
      return undefined;
    }

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((expiresAt.getTime() - now) / 1000));
      setHoldTimer(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const normalizedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return rooms.map((room) => ({
      ...room,
      isSelected: selectedRooms.includes(room.roomNumber),
      isUnavailable: room.status === 'BOOKED' || (room.status === 'HELD' && !room.isHeldByUser)
    }));
  }, [rooms, selectedRooms]);

  const fetchAvailability = async (overrideSelection) => {
    try {
      setLoading(true);
      setError(null);
      const response = await hotelService.getRoomAvailability(hotelId, {
        tripId,
        checkIn,
        checkOut,
        holdToken: holdToken || undefined,
        roomsNeeded: roomsRequired
      });
      const data = getPayloadData(response);

      setRooms(data.rooms || []);
      setSuggestedRooms(data.suggestedRooms || []);

      const selectedRoomNumbers = overrideSelection ?? selection?.roomNumbers ?? [];

      if (data.holdToken && onSelectionChange) {
        onSelectionChange({
          roomNumbers: selectedRoomNumbers,
          holdToken: data.holdToken,
          expiresAt: data.expiresAt || null,
          checkIn,
          checkOut
        });
      }
    } catch (err) {
      console.error('Failed to fetch room availability:', err);
      setError(err?.message || 'Unable to fetch room availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = async (roomNumber) => {
    if (!onSelectionChange) return;
    const alreadySelected = selectedRooms.includes(roomNumber);

    if (alreadySelected) {
      if (selection?.holdToken) {
        try {
          await hotelService.releaseRooms(hotelId, selection.holdToken, {
            tripId,
            checkIn,
            checkOut,
            roomNumbers: [roomNumber]
          });
        } catch (releaseError) {
          console.warn('Failed to release room (continuing locally):', releaseError);
        }
      }
      const updatedRooms = selectedRooms.filter((room) => room !== roomNumber);
      onSelectionChange({
        roomNumbers: updatedRooms,
        holdToken: updatedRooms.length ? selection.holdToken : null,
        expiresAt: updatedRooms.length ? selection.expiresAt : null,
        checkIn,
        checkOut
      });
      fetchAvailability(updatedRooms);
      return;
    }

    if (selectedRooms.length >= roomsRequired) {
      setInfoMessage(`You can select up to ${roomsRequired} room${roomsRequired > 1 ? 's' : ''}.`);
      return;
    }

    try {
      const response = await hotelService.holdRooms(hotelId, {
        tripId,
        checkIn,
        checkOut,
        roomNumbers: [roomNumber],
        holdToken: selection?.holdToken || undefined,
        roomsNeeded: roomsRequired
      });
      const data = getPayloadData(response);
      const heldRooms = data.heldRooms || [roomNumber];
      const nextRooms = Array.from(new Set([...selectedRooms, ...heldRooms]));

      onSelectionChange({
        roomNumbers: nextRooms,
        holdToken: data.holdToken || selection?.holdToken || null,
        expiresAt: data.expiresAt || selection?.expiresAt || null,
        checkIn,
        checkOut
      });
      setInfoMessage(null);
      fetchAvailability(nextRooms);
    } catch (err) {
      console.error('Failed to hold room:', err);
      setInfoMessage(err?.message || 'Unable to hold room. Try refreshing availability.');
    }
  };

  const handleUseSuggestion = async () => {
    if (!suggestedRooms.length) return;
    try {
      const response = await hotelService.holdRooms(hotelId, {
        tripId,
        checkIn,
        checkOut,
        roomNumbers: suggestedRooms,
        holdToken: selection?.holdToken || undefined,
        roomsNeeded: roomsRequired
      });
      const data = getPayloadData(response);
      onSelectionChange({
        roomNumbers: data.heldRooms || suggestedRooms,
        holdToken: data.holdToken || selection?.holdToken || null,
        expiresAt: data.expiresAt || selection?.expiresAt || null,
        checkIn,
        checkOut
      });
      setInfoMessage(null);
      fetchAvailability(data.heldRooms || suggestedRooms);
    } catch (err) {
      console.error('Failed to hold suggested rooms:', err);
      setInfoMessage(err?.message || 'Unable to hold suggested rooms.');
    }
  };

  const renderRoomCard = (room) => {
    const disabled = room.isUnavailable;
    const statusLabel = room.isSelected
      ? 'Selected'
      : room.status === 'AVAILABLE'
      ? 'Available'
      : room.status === 'BOOKED'
      ? 'Booked'
      : room.status === 'HELD' && room.isHeldByUser
      ? 'Held by you'
      : 'Held';

    const statusClassName = cn(
      room.isSelected && 'text-primary font-semibold',
      room.status === 'BOOKED' && 'text-red-600',
      room.status === 'HELD' && room.isHeldByUser && !room.isSelected && 'text-amber-600',
      room.status === 'HELD' && !room.isHeldByUser && 'text-red-500'
    );
    return (
      <button
        key={room.roomNumber}
        type="button"
        onClick={() => handleSelectRoom(room.roomNumber)}
        disabled={disabled}
        className={cn(
          'flex flex-col items-start rounded-lg border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          room.isSelected && 'border-primary bg-primary/10 text-primary-foreground',
          disabled && 'border-red-200 bg-red-50 text-red-600 cursor-not-allowed',
          !room.isSelected && !disabled && 'hover:border-primary/60 hover:bg-primary/5'
        )}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BedDouble className="h-4 w-4" />
          <span>Room {room.roomNumber}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {room.roomType && (
            <Badge variant="outline" className="uppercase">
              {room.roomType}
            </Badge>
          )}
          {room.capacity && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Sleeps {room.capacity}
            </span>
          )}
          <span className={statusClassName}>{statusLabel}</span>
        </div>
      </button>
    );
  };

  return (
    <Card className={cn('shadow-none border border-dashed border-gray-200 bg-gray-50', className)}>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="outline">
              {roomsRequired} room{roomsRequired > 1 ? 's' : ''} needed
            </Badge>
            <Badge variant="outline">
              {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => fetchAvailability()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {suggestedRooms.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleUseSuggestion}>
                Use Suggested ({suggestedRooms.join(', ')})
              </Button>
            )}
          </div>
        </div>

        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Rooms held for {Math.floor(holdTimer / 60)}m {holdTimer % 60}s
          </div>
        )}

        {infoMessage && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading rooms...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {normalizedRooms.map(renderRoomCard)}
          </div>
        )}

        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900">Selected Rooms</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {selectedRooms.length > 0 ? (
              selectedRooms.map((room) => (
                <Badge key={room} variant="secondary">
                  Room {room}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500">No rooms selected yet.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelRoomPicker;

