export const pimplenet = {
  id: "pimplenet",
  slug: "pimplenet",
  project: "pimplenet",
  title: "PimpleNet",
  badge: { label: "Internship", color: "accent-2" },
  kicker: "Machine Learning",
  summary: "A deep learning acne severity classifier built to enhance microbiome-based skincare personalization at PurelyBiome.",
  marginNote: "95.6% accuracy :)",
  actions: [
    { label: "Open Full Research Paper (PDF)", href: "/assets/NextAI__Oladele_.pdf", icon: "document", color: "accent" },
    { label: "See It Live · Sample Report", href: "https://report.purelybiome.com/sample-report", icon: "external", color: "accent-2" },
  ],
  modern: { file: "pimplenet_case_study.md", prompt: "omj@server:~$", glow: "accent-2", layout: "single" },
  sections: [
    {
      id: "directive",
      label: "The Directive",
      blocks: [
        { type: "heading", text: "The Directive", color: "accent" },
        { type: "text", body: "PurelyBiome’s core product combines at-home skin microbiome testing with personalized skincare recommendations. However, only biological data gives an incomplete picture. It lacks the visual context of the user's current skin state. During the onboarding process, users submit facial images as well as their microbiome samples. The idea was to build an automated computer vision pipeline that was able to interpret these images and grade the users acne severity. By combining biological microbiome profiles and visible skin presentation, the model enables targeted, product recommendations and creates a great starting point for detecting when a user's skin is trending toward an acne-prone state before breakouts can even occur." },
      ],
    },
    {
      id: "architecture",
      label: "System Architecture & Process",
      blocks: [
        { type: "heading", text: "System Architecture & Process", color: "accent-2" },
        { type: "text", body: "The system architecture was built on an iterative transfer learning pipeline using an EfficientNetB0 backbone. Data preparation involved rigorous cleaning of corrupted files followed by the consolidation of the ACNE04 dataset, which was supplemented with images from the FFHQ dataset to add a normalization layer (show the model what skin without acne was). I applied random physical augmentations—including rotation, zoom, and contrast adjustments to prevent the model from memorizing the releatively small ACNE04 dataset. The process of training and making the model utilized a 2 phase training strategy: Phase 1 involved freezing the pretrained EfficientNet layer to stabilize the customized classification head of the model, while Phase 2 selectively unfroze the final 50 layers for fine-tuning, allowing the model to adapt high-level visual features to specific acne-related patterns." },
        { type: "figure", src: "/assets/images/pimplenet-training-graph.png", alt: "PimpleNet Inference Output" },
      ],
    },
    {
      id: "iterations",
      label: "Bottlenecks & Iterations",
      blocks: [
        { type: "heading", text: "Bottlenecks & Iterations", color: "warn" },
        {
          type: "points",
          tone: "warn",
          items: [
            { title: "Iteration 1: Overfitting & Image Blinding.", body: "After the base model implementation, I encountered significant overfitting. I addressed this by introducing basic image augmentation (image rotation and image flipping) and image blinding, forcing the model to learn acne features rather than memorizing noise." },
            { title: "Iteration 2: Epoch Management.", body: "The model was overfitting due to an excessive number of training epochs, leading to data memorization. I implemented keras built in early stopping and a dedicated dropout layer to regularize the training process. The model now saved two versions, the best model and the last model" },
            { title: "Iteration 3: Architecture & Compute Scaling.", body: "I implemented a transfer learning approach to leverage pretrained features. To tackle how long it took to train the model per change, I started using Google T4 GPU instead of just the built in CPU, significantly reducing iteration cycle times from 5 hours to 30 mins." },
            { title: "Iteration 4: Dataset Synthesis & Quality Normalization.", body: "I expanded the dataset by integrating the Flickr-Faces HQ (FFHQ) dataset to provide clear skin baselines(showing the model what clear skin looks like and having a 0 acne class). In the original ACNE04 dataset there are 4 classes leveled 1,2,3 and 4 to recognize the severity of the acne. Due to the dataset being rather small, I merged classes 1 and 2 as well as classes 3 and 4 to correct the small sample size bias. A key bottleneck here was the model started to learn based on differentiating images on their photo quality (FFHQ is professional studio grade images vs. Acne04 clinic worse quality images); I resolved this by applying heavy, unified data augmentation (image color contrasting, more frequent image rotation and flips)." },
            { title: "Iteration 5: Optimization & Class Balancing.", body: "I upgraded the architecture from EfficientNetB0 to EfficientNetB3 for higher capacity To combat the data imbalance (where 'Severe' images were significantly scarcer than others), I utilized Keras built-in class weighting to force the model to prioritize underrepresented classes during optimization" },
            { title: "Validation Strategy.", body: "To ensure real-world viability, I finalized inference testing exclusively on held-out customer images that the model had never seen during training or validation, confirming strong generalization." },
          ],
        },
      ],
    },
    {
      id: "impact",
      label: "Output & Impact",
      blocks: [
        { type: "heading", text: "Output & Impact", color: "ok" },
        { type: "text", variant: "light", body: "The final model surpassed initial benchmarks, establishing a robust visual analysis layer that bridges the gap between biological microbiome data and visible skin presentation. During validation, the model achieved a 95.56% accuracy rate, complemented by a 95.30% weighted F1-score and a 90.81% macro F1-score, proving its ability to reliably distinguish between Clear Skin, Mild/Moderate, and Severe acne cases. " },
        { type: "text", variant: "light", body: "The most critical indicator of real-world viability, however, was the model's performance on a held-out set of 50 representative customer images; the model achieved 100% accuracy, demonstrating that it successfully generalized beyond academic datasets to the actual noisy, varied lighting and angles found in user-submitted photos. This validated the architectural transition to a dual-data approach, providing PurelyBiome with an objective, visual-based skin health tracking system. This success establishes a foundation for future high-value product features, such as longitudinal progress monitoring and targeted, facial-area-specific skincare recommendations." },
        { type: "text", variant: "light", body: "This visual analysis now lives in production, powering the Visual Skin Analysis in PurelyBiome's customer report, where a user's photos are tied directly to their microbiome profile to drive targeted recommendations. [View a live sample report →](https://report.purelybiome.com/sample-report)" },
      ],
    },
  ],
};
