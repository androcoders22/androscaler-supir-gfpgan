import { ImageUploader } from "@/components/ImageUploader";

const Index = () => {
  return (
    <div className="w-full px-4 my-6 space-y-10">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Channel : 1</h2>

          <ImageUploader pipeline="upscale" />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Channel : 3</h2>
          <ImageUploader pipeline="color" />
        </div>
      </div>
    </div>
  );
};

export default Index;
