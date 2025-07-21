// src/components/home/ContactHomeSection.tsx
export function ContactHomeSection() {
  return (
    <section className="bg-gray-800 py-16 text-white">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold">Get in Touch</h2>
        <p className="mb-8 text-lg opacity-90">
          Have questions or need support? Reach out to us!
        </p>
        <div className="space-y-4 text-xl">
          <p>
            Email:{" "}
            <a
              href="mailto:contact@menuhub.com"
              className="text-blue-400 hover:underline"
            >
              contact@menuhub.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+1234567890" className="text-blue-400 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
        {/* Form will be added here later */}
      </div>
    </section>
  );
}
