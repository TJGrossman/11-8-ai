"use client";

import { useState } from "react";
import { useSession } from "@/lib/discovery-store";
import type { PainPoint } from "@/lib/discovery-types";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, GripVertical, Plus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

function SortableCard({
  point,
  onRemove,
  onUpdateHours,
  onUpdateConsequence,
}: {
  point: PainPoint;
  onRemove: () => void;
  onUpdateHours: (hrs: number | null) => void;
  onUpdateConsequence: (text: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{point.label}</span>
            {point.isCustom && (
              <button
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Hours per week this costs
              </label>
              <input
                type="number"
                min={0}
                max={168}
                value={point.hoursPerWeek ?? ""}
                onChange={(e) =>
                  onUpdateHours(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="e.g. 8"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                What happens when it falls through the cracks?
              </label>
              <input
                type="text"
                value={point.consequence}
                onChange={(e) => onUpdateConsequence(e.target.value)}
                placeholder="e.g. Lost leads, angry tenants..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepPainPoints({ onNext, onBack }: StepProps) {
  const { session, dispatch } = useSession();
  const [customLabel, setCustomLabel] = useState("");

  const selected = session.painPoints.filter((p) => p.selected);
  const unselected = session.painPoints.filter((p) => !p.selected);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleSelect = (id: string) => {
    const updated = session.painPoints.map((p) =>
      p.id === id ? { ...p, selected: !p.selected, rank: !p.selected ? selected.length : null } : p
    );
    dispatch({ type: "SET_PAIN_POINTS", painPoints: updated });
  };

  const addCustom = () => {
    if (!customLabel.trim()) return;
    const newPoint: PainPoint = {
      id: uuidv4(),
      label: customLabel.trim(),
      isCustom: true,
      selected: true,
      rank: selected.length,
      hoursPerWeek: null,
      consequence: "",
    };
    dispatch({
      type: "SET_PAIN_POINTS",
      painPoints: [...session.painPoints, newPoint],
    });
    setCustomLabel("");
  };

  const removePoint = (id: string) => {
    dispatch({
      type: "SET_PAIN_POINTS",
      painPoints: session.painPoints.filter((p) => p.id !== id),
    });
  };

  const updateHours = (id: string, hrs: number | null) => {
    dispatch({
      type: "SET_PAIN_POINTS",
      painPoints: session.painPoints.map((p) =>
        p.id === id ? { ...p, hoursPerWeek: hrs } : p
      ),
    });
  };

  const updateConsequence = (id: string, text: string) => {
    dispatch({
      type: "SET_PAIN_POINTS",
      painPoints: session.painPoints.map((p) =>
        p.id === id ? { ...p, consequence: text } : p
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selected.findIndex((p) => p.id === active.id);
    const newIndex = selected.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(selected, oldIndex, newIndex).map((p, i) => ({
      ...p,
      rank: i,
    }));

    const newPainPoints = session.painPoints.map((p) => {
      const updated = reordered.find((r) => r.id === p.id);
      return updated || p;
    });
    dispatch({ type: "SET_PAIN_POINTS", painPoints: newPainPoints });
  };

  const hasEnoughData =
    selected.length >= 2 &&
    selected.some((p) => p.hoursPerWeek !== null && p.hoursPerWeek > 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What eats the most time?
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Select the tasks that consume the most hours, then drag to rank them.
          We&apos;ll dig into the top ones.
        </p>
      </div>

      {/* Unselected cards to pick from */}
      {unselected.length > 0 && (
        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium text-muted-foreground">
            Tap to select the ones that apply
          </label>
          <div className="flex flex-wrap gap-2">
            {unselected.map((point) => (
              <button
                key={point.id}
                onClick={() => toggleSelect(point.id)}
                className="rounded-full border border-border px-4 py-2 text-sm transition-all hover:border-primary hover:text-primary"
              >
                {point.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add custom */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Add a custom pain point..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button variant="outline" size="sm" onClick={addCustom} disabled={!customLabel.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected & ranked */}
      {selected.length > 0 && (
        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium">
            Drag to rank by severity — worst first
          </label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selected.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selected.map((point) => (
                  <SortableCard
                    key={point.id}
                    point={point}
                    onRemove={() => removePoint(point.id)}
                    onUpdateHours={(hrs) => updateHours(point.id, hrs)}
                    onUpdateConsequence={(text) =>
                      updateConsequence(point.id, text)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!hasEnoughData} className="gap-2">
          See the Value Map
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
