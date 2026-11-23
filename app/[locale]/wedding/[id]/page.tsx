import { generateWeddingMetadata, renderWeddingPage, type WeddingPageProps } from './wedding-page';

export const generateMetadata = generateWeddingMetadata;

export default function WeddingPage({ params, searchParams }: WeddingPageProps) {
  return renderWeddingPage(params, searchParams, false);
}
