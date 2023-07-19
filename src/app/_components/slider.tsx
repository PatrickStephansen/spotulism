import { PointerEvent, useCallback, useState } from "react";

interface Props {
  min: number;
  max: number;
  value: number;
  className: string;
  onDrag?: (value: number) => void;
  onChange?: (value: number) => void;
}

export const Slider = ({
  min,
  max,
  value,
  onDrag,
  onChange,
  className,
}: Props) => {
  const [isGrabbing, setGrabbingState] = useState(false);
  const [dragToValue, setDragToValue] = useState<number>();
  const clampValue = useCallback(
    (value: number) => (value < min ? min : value > max ? max : value),
    [min, max]
  );
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.target.setPointerCapture(event.pointerId);
    setGrabbingState(true);
  };
  const onPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isGrabbing) return;
    event.preventDefault();
    event.stopPropagation();
    const targetWidth = event.nativeEvent.target?.clientWidth ?? 1;
    const targetPosition = clampValue(
      min + max * (event.nativeEvent.offsetX / targetWidth)
    );
    setDragToValue(targetPosition);
    if (onDrag) {
      onDrag(targetPosition);
    }
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setGrabbingState(false);
    const targetWidth = event.nativeEvent.target?.clientWidth ?? 1;
    setDragToValue(undefined);
    if (onChange) {
      onChange(
        clampValue(min + max * (event.nativeEvent.offsetX / targetWidth))
      );
    }
  };
  const progressPercent = (100 * (value - min)) / (max - min);
  const handlePercent =
    dragToValue === undefined
      ? progressPercent
      : (100 * (dragToValue - min)) / (max - min);
  return (
    <div
      className={`group relative rounded h-3 bg-black ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerDrag}
      onPointerUp={onPointerUp}
    >
      <div
        className="bg-green-600 absolute left-0 top-0 rounded h-3 pointer-events-none progress"
        style={{ width: `${progressPercent}%` }}
      ></div>
      <div
        className="bg-blue-700 absolute top-0 h-3 w-3 pointer-events-none handle border rounded-full invisible group-hover:visible"
        style={{ left: `calc(${handlePercent}% - 6px)` }}
      ></div>
    </div>
  );
};
