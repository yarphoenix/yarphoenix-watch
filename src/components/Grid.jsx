import { PosterCard } from "./PosterCard";

// Responsive poster grid. `cols` drives the --cols custom property the CSS reads.
export function Grid({ films, onOpen, cols }) {
  return (
    <div className="grid" style={{ "--cols": cols }}>
      {films.map((f, i) => <PosterCard key={f.id} film={f} onOpen={onOpen} index={i} />)}
    </div>
  );
}
