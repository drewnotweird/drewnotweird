export default function ImageSection({ images }) {
  return (
    <section className="image">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt=""
          className={`${img.layout}-width`}
          loading="lazy"
        />
      ))}
    </section>
  )
}
