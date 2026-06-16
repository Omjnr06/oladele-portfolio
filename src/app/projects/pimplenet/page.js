"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PimpleNetCaseStudy() {
  return (
    <main className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[var(--accent-cyan)] selection:text-black relative overflow-x-hidden">
      
      {/* Background Dots from Main Page */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-journal-dots opacity-80" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        
        {/* Back Navigation */}
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12 font-mono text-[10px] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Projects
        </Link>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-[#8b5cf6] tracking-[0.3em] uppercase bg-[#8b5cf6]/10 px-3 py-1 rounded border border-[#8b5cf6]/20">
              Internship
            </span>
            <span className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase">
              // Machine Learning
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">PimpleNet</h1>
          <p className="text-xl text-white/60 font-light leading-relaxed max-w-2xl">
            A deep learning acne severity classifier built to enhance microbiome-based skincare personalization at PurelyBiome.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <a 
            href="/NextAI__Oladele_.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 rounded shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:bg-[var(--accent-cyan)]/20 hover:border-[var(--accent-cyan)]/60 transition-all group"
          >
            <svg className="w-5 h-5 text-[var(--accent-cyan)] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
            <span className="font-mono text-xs uppercase tracking-widest text-white">Open Full Research Paper (PDF)</span>
          </a>
        </motion.div>

        {/* Terminal Layout for the Write-up */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Terminal Header */}
          <div className="h-10 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 font-mono text-[10px] text-white/30 tracking-widest">pimplenet_case_study.md</span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 md:p-10 font-mono text-sm leading-relaxed text-white/80 space-y-12">
            
            {/* The Context */}
            <section>
              <h2 className="text-[var(--accent-cyan)] font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-white/30">{`>`}</span> The Directive
              </h2>
              <p className="mb-4">
                PurelyBiome’s core product combines at-home skin microbiome testing with personalized skincare recommendations. However, only biological data gives an incomplete picture. It lacks the visual context of the user's current skin state. During the onboarding process, users submit facial images as well as their microbiome samples. The idea was to build an automated computer vision pipeline that was able to interpret these images and grade the users acne severity. By combining biological microbiome profiles and visible skin presentation, the model enables targeted, product recommendations and creates a great starting point for detecting when a user's skin is trending toward an acne-prone state before breakouts can even occur.
              </p>
            </section>

            {/* The Architecture / Process */}
            <section>
              <h2 className="text-[#8b5cf6] font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-white/30">{`>`}</span> System Architecture & Process
              </h2>
              <p className="mb-4">
                The system architecture was built on an iterative transfer learning pipeline using an EfficientNetB0 backbone. Data preparation involved rigorous cleaning of corrupted files followed by the consolidation of the ACNE04 dataset, which was supplemented with images from the FFHQ dataset to add a normalization layer (show the model what skin without acne was). I applied random physical augmentations—including rotation, zoom, and contrast adjustments to prevent the model from memorizing the releatively small ACNE04 dataset. The process of training and making the model utilized a 2 phase training strategy: Phase 1 involved freezing the pretrained EfficientNet layer to stabilize the customized classification head of the model, while Phase 2 selectively unfroze the final 50 layers for fine-tuning, allowing the model to adapt high-level visual features to specific acne-related patterns.
              </p>
              {/* Optional: You can drop the image you showed me earlier right here! */}
              <div className="my-8 border border-white/10 p-2 rounded bg-black/50">
                <img src="/images/pimplenet-training-graph.png" alt="PimpleNet Inference Output" className="w-full rounded opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </section>

            {/* The Bottlenecks */}
            <section>
              <h2 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-white/30">{`>`}</span> Bottlenecks & Iterations
              </h2>
              <p className="mb-4">
                {/* The Bottlenecks */}

              
            <ul className="space-y-6 list-none">
                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Iteration 1: Overfitting & Image Blinding.</span> 
                  <br /> After the base model implementation, I encountered significant overfitting. I addressed this by introducing basic image augmentation (image rotation and image flipping) and image blinding, forcing the model to learn acne features rather than memorizing noise.
                </li>

                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Iteration 2: Epoch Management.</span> 
                  <br /> The model was overfitting due to an excessive number of training epochs, leading to data memorization. I implemented keras built in early stopping and a dedicated dropout layer to regularize the training process. The model now saved two versions, the best model and the last model
                </li>

                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Iteration 3: Architecture & Compute Scaling.</span> 
                  <br /> I implemented a transfer learning approach to leverage pretrained features. To tackle how long it took to train the model per change, I started using Google T4 GPU instead of just the built in CPU, significantly reducing iteration cycle times from 5 hours to 30 mins.
                </li>

                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Iteration 4: Dataset Synthesis & Quality Normalization.</span> 
                  <br /> I expanded the dataset by integrating the Flickr-Faces HQ (FFHQ) dataset to provide clear skin baselines(showing the model what clear skin looks like and having a 0 acne class). In the original ACNE04 dataset there are 4 classes leveled 1,2,3 and 4 to recognize the severity of the acne. Due to the dataset being rather small, I merged classes 1 and 2 as well as classes 3 and 4 to correct the small sample size bias. A key bottleneck here was the model started to learn based on differentiating images on their photo quality (FFHQ is professional studio grade images vs. Acne04 clinic worse quality images); I resolved this by applying heavy, unified data augmentation (image color contrasting, more frequent image rotation and flips).
                </li>

                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Iteration 5: Optimization & Class Balancing.</span> 
                  <br /> I upgraded the architecture from EfficientNetB0 to EfficientNetB3 for higher capacity To combat the data imbalance (where 'Severe' images were significantly scarcer than others), I utilized Keras built-in class weighting to force the model to prioritize underrepresented classes during optimization
                </li>

                <li className="pl-4 border-l-2 border-yellow-400/30">
                  <span className="text-white font-bold">Validation Strategy.</span> 
                  <br /> To ensure real-world viability, I finalized inference testing exclusively on held-out customer images that the model had never seen during training or validation, confirming strong generalization.
                </li>
              </ul>
              </p>
            </section>

            {/* The Results */}
            <section>
              <h2 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-white/30">{`>`}</span> Output & Impact
              </h2>
              <p className="text-white/80 leading-relaxed font-light">
                The final model surpassed initial benchmarks, establishing a robust visual analysis layer that bridges the gap between biological microbiome data and visible skin presentation. During validation, the model achieved a 95.56% accuracy rate, complemented by a 95.30% weighted F1-score and a 90.81% macro F1-score, proving its ability to reliably distinguish between Clear Skin, Mild/Moderate, and Severe acne cases. 
              </p>
              
              <p className="text-white/80 leading-relaxed font-light mt-4">
                The most critical indicator of real-world viability, however, was the model's performance on a held-out set of 50 representative customer images; the model achieved 100% accuracy, demonstrating that it successfully generalized beyond academic datasets to the actual noisy, varied lighting and angles found in user-submitted photos. This validated the architectural transition to a dual-data approach, providing PurelyBiome with an objective, visual-based skin health tracking system. This success establishes a foundation for future high-value product features, such as longitudinal progress monitoring and targeted, facial-area-specific skincare recommendations.
              </p>
            </section>
              
              {/* Terminal Exit Line */}
            <section>
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-2 text-white/40">
                <span>omj@server:~$</span>
                <span className="animate-pulse bg-white/60 w-2 h-4 inline-block" />
              </div>
            </section>

          </div>
        </motion.div>

      </div>
    </main>
  );
}