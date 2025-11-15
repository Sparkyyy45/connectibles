import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-40 scroll-mt-20 relative" aria-labelledby="features-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h2 id="features-heading" className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900">
          Everything You Need to
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent"> Connect</span>
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
          Powerful features designed to help you build meaningful relationships and collaborate effectively
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="relative group cursor-default"
            >
              <div className="relative p-10 rounded-3xl border-2 border-purple-200/50 bg-white/80 backdrop-blur-xl hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.05] rounded-3xl transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-10 w-10 text-white" aria-hidden="true" />
                  </div>
                  
                  <h3 className="text-2xl font-bold tracking-tight mb-5 text-slate-900">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
