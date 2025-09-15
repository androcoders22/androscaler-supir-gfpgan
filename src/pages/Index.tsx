import { ImageUploader } from "@/components/ImageUploader";

const Index = () => {
  return (
    <div className="w-full h-full py-20">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2">
        <div className="space-y-12">
          <ImageUploader pipeline="upscale" />
        </div>
        <div className="space-y-12">
          <ImageUploader pipeline="color" />
        </div>
      </div>
    </div>
  );
};

export default Index;
