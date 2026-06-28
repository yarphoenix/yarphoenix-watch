import { PosterCard } from "./PosterCard";

// Responsive poster grid, rendered as a list. `cols` drives the --cols custom property the CSS reads.
// role="list" restores list semantics in Safari, which drops them when list-style:none + display:grid.
export function Grid({ films, cols }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- role="list" restores list semantics WebKit drops when list-style:none + display:grid are applied
    <ul className="grid" role="list" style={{ "--cols": cols }}>
      {films.map((f, i) => (
        <li key={f.id}>
          <PosterCard film={f} index={i} />
        </li>
      ))}
    </ul>
  );
}
