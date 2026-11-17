import CaseStudy from "@/app/components/caseStudy/CaseStudy";
import { getCaseStudy } from "@/content/caseStudies";

export default function Page() {
  return <CaseStudy study={getCaseStudy("vault")} />;
}
