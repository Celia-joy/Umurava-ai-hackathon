"use client";

import { Dispatch, SetStateAction } from "react";
import { FieldGroup, FieldLabel, SecondaryButton, SelectInput, TextArea, TextInput } from "@/components/forms";
import { csvToList, listToCsv } from "@/lib/talentProfile";
import { TalentProfile } from "@/lib/types";

interface TalentProfileEditorProps {
  profile: TalentProfile;
  setProfile: Dispatch<SetStateAction<TalentProfile>>;
  compact?: boolean;
}

const availabilityOptions = ["Immediate", "2 weeks", "1 month", "Negotiable", "Open to discuss"];
const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const languageLevels = ["Basic", "Conversational", "Professional", "Native"];

export function TalentProfileEditor({ profile, setProfile, compact = false }: TalentProfileEditorProps) {
  const updateBasicInfo = (field: keyof TalentProfile["basicInfo"], value: string) =>
    setProfile((current) => ({ ...current, basicInfo: { ...current.basicInfo, [field]: value } }));

  const updateAvailability = (field: keyof TalentProfile["availability"], value: string) =>
    setProfile((current) => ({ ...current, availability: { ...current.availability, [field]: value } }));

  const addSkill = () => setProfile((current) => ({
    ...current,
    skills: [...current.skills, { name: "", level: "", yearsOfExperience: 0 }]
  }));

  const addLanguage = () => setProfile((current) => ({
    ...current,
    languages: [...current.languages, { name: "", proficiency: "" }]
  }));

  const addExperience = () => setProfile((current) => ({
    ...current,
    experience: [...current.experience, { company: "", role: "", startDate: "", endDate: "", description: "", technologies: [], isCurrent: false }]
  }));

  const addEducation = () => setProfile((current) => ({
    ...current,
    education: [...current.education, { institution: "", degree: "", fieldOfStudy: "", startYear: null, endYear: null }]
  }));

  const addCertification = () => setProfile((current) => ({
    ...current,
    certifications: [...current.certifications, { name: "", issuer: "", issueDate: "", expirationDate: "", credentialId: "" }]
  }));

  const addProject = () => setProfile((current) => ({
    ...current,
    projects: [...current.projects, { name: "", description: "", technologies: [], role: "", url: "" }]
  }));

  const addSocialLink = () => setProfile((current) => ({
    ...current,
    socialLinks: [...current.socialLinks, { platform: "", url: "" }]
  }));

  return (
    <div className="grid gap-5">
      <FieldGroup title="Basic Info" subtitle="Official talent profile identity and summary fields.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>First Name</FieldLabel>
            <TextInput value={profile.basicInfo.firstName} onChange={(event) => updateBasicInfo("firstName", event.target.value)} />
          </div>
          <div className="space-y-2">
            <FieldLabel>Last Name</FieldLabel>
            <TextInput value={profile.basicInfo.lastName} onChange={(event) => updateBasicInfo("lastName", event.target.value)} />
          </div>
          <div className="space-y-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput type="email" value={profile.basicInfo.email} onChange={(event) => updateBasicInfo("email", event.target.value)} />
          </div>
          <div className="space-y-2">
            <FieldLabel>Location</FieldLabel>
            <TextInput value={profile.basicInfo.location} onChange={(event) => updateBasicInfo("location", event.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel>Headline</FieldLabel>
          <TextInput value={profile.basicInfo.headline} onChange={(event) => updateBasicInfo("headline", event.target.value)} />
        </div>
        <div className="space-y-2">
          <FieldLabel>Bio</FieldLabel>
          <TextArea value={profile.basicInfo.bio} onChange={(event) => updateBasicInfo("bio", event.target.value)} />
        </div>
      </FieldGroup>

      <FieldGroup title="Skills" subtitle="Dynamic structured skill entries with level and years of experience.">
        <div className="grid gap-4">
          {profile.skills.map((skill, index) => (
            <div key={`skill-${index}`} className="grid gap-3 rounded-3xl border border-brand-100 bg-white p-4 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
              <TextInput
                placeholder="Skill name"
                value={skill.name}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  skills: current.skills.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)
                }))}
              />
              <SelectInput
                value={skill.level}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  skills: current.skills.map((item, itemIndex) => itemIndex === index ? { ...item, level: event.target.value } : item)
                }))}
              >
                <option value="">Level</option>
                {skillLevels.map((level) => <option key={level} value={level}>{level}</option>)}
              </SelectInput>
              <TextInput
                type="number"
                min={0}
                placeholder="Years"
                value={skill.yearsOfExperience}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  skills: current.skills.map((item, itemIndex) => itemIndex === index ? { ...item, yearsOfExperience: Number(event.target.value) } : item)
                }))}
              />
              <SecondaryButton type="button" onClick={() => setProfile((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))}>
                Remove
              </SecondaryButton>
            </div>
          ))}
        </div>
        <SecondaryButton type="button" onClick={addSkill}>Add Skill</SecondaryButton>
      </FieldGroup>

      {!compact && (
        <FieldGroup title="Languages" subtitle="Optional language proficiency details for global roles.">
          <div className="grid gap-4">
            {profile.languages.map((language, index) => (
              <div key={`language-${index}`} className="grid gap-3 rounded-3xl border border-brand-100 bg-white p-4 md:grid-cols-[1.2fr_1fr_auto]">
                <TextInput
                  placeholder="Language"
                  value={language.name}
                  onChange={(event) => setProfile((current) => ({
                    ...current,
                    languages: current.languages.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)
                  }))}
                />
                <SelectInput
                  value={language.proficiency}
                  onChange={(event) => setProfile((current) => ({
                    ...current,
                    languages: current.languages.map((item, itemIndex) => itemIndex === index ? { ...item, proficiency: event.target.value } : item)
                  }))}
                >
                  <option value="">Proficiency</option>
                  {languageLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </SelectInput>
                <SecondaryButton type="button" onClick={() => setProfile((current) => ({ ...current, languages: current.languages.filter((_, itemIndex) => itemIndex !== index) }))}>
                  Remove
                </SecondaryButton>
              </div>
            ))}
          </div>
          <SecondaryButton type="button" onClick={addLanguage}>Add Language</SecondaryButton>
        </FieldGroup>
      )}

      <FieldGroup title="Experience" subtitle="Work history entries used directly in deterministic scoring and AI explanations.">
        <div className="grid gap-4">
          {profile.experience.map((experience, index) => (
            <div key={`experience-${index}`} className="grid gap-4 rounded-3xl border border-brand-100 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput placeholder="Company" value={experience.company} onChange={(event) => setProfile((current) => ({
                  ...current,
                  experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, company: event.target.value } : item)
                }))} />
                <TextInput placeholder="Role" value={experience.role} onChange={(event) => setProfile((current) => ({
                  ...current,
                  experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item)
                }))} />
                <TextInput placeholder="Start date" value={experience.startDate} onChange={(event) => setProfile((current) => ({
                  ...current,
                  experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, startDate: event.target.value } : item)
                }))} />
                <TextInput placeholder="End date" value={experience.endDate} onChange={(event) => setProfile((current) => ({
                  ...current,
                  experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, endDate: event.target.value } : item)
                }))} />
              </div>
              <TextInput
                placeholder="Technologies used, comma separated"
                value={listToCsv(experience.technologies)}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, technologies: csvToList(event.target.value) } : item)
                }))}
              />
              <TextArea placeholder="What did you build or deliver?" value={experience.description} onChange={(event) => setProfile((current) => ({
                ...current,
                experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item)
              }))} />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={experience.isCurrent}
                  onChange={(event) => setProfile((current) => ({
                    ...current,
                    experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, isCurrent: event.target.checked } : item)
                  }))}
                />
                Current role
              </label>
              <SecondaryButton type="button" className="w-fit" onClick={() => setProfile((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }))}>
                Remove Experience
              </SecondaryButton>
            </div>
          ))}
        </div>
        <SecondaryButton type="button" onClick={addExperience}>Add Experience</SecondaryButton>
      </FieldGroup>

      <FieldGroup title="Projects" subtitle="Projects are a major ranking signal in the hybrid scoring system.">
        <div className="grid gap-4">
          {profile.projects.map((project, index) => (
            <div key={`project-${index}`} className="grid gap-4 rounded-3xl border border-brand-100 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput placeholder="Project name" value={project.name} onChange={(event) => setProfile((current) => ({
                  ...current,
                  projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)
                }))} />
                <TextInput placeholder="Your role" value={project.role} onChange={(event) => setProfile((current) => ({
                  ...current,
                  projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item)
                }))} />
              </div>
              <TextInput placeholder="Technologies used, comma separated" value={listToCsv(project.technologies)} onChange={(event) => setProfile((current) => ({
                ...current,
                projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, technologies: csvToList(event.target.value) } : item)
              }))} />
              <TextInput placeholder="Project URL" value={project.url} onChange={(event) => setProfile((current) => ({
                ...current,
                projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item)
              }))} />
              <TextArea placeholder="Describe the project impact" value={project.description} onChange={(event) => setProfile((current) => ({
                ...current,
                projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item)
              }))} />
              <SecondaryButton type="button" className="w-fit" onClick={() => setProfile((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}>
                Remove Project
              </SecondaryButton>
            </div>
          ))}
        </div>
        <SecondaryButton type="button" onClick={addProject}>Add Project</SecondaryButton>
      </FieldGroup>

      {!compact && (
        <>
          <FieldGroup title="Education" subtitle="Add academic history relevant to the target role.">
            <div className="grid gap-4">
              {profile.education.map((education, index) => (
                <div key={`education-${index}`} className="grid gap-3 rounded-3xl border border-brand-100 bg-white p-4 md:grid-cols-[1.2fr_1fr_1fr_0.6fr_0.6fr_auto]">
                  <TextInput placeholder="Institution" value={education.institution} onChange={(event) => setProfile((current) => ({
                    ...current,
                    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, institution: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Degree" value={education.degree} onChange={(event) => setProfile((current) => ({
                    ...current,
                    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, degree: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Field of study" value={education.fieldOfStudy} onChange={(event) => setProfile((current) => ({
                    ...current,
                    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, fieldOfStudy: event.target.value } : item)
                  }))} />
                  <TextInput type="number" placeholder="Start" value={education.startYear ?? ""} onChange={(event) => setProfile((current) => ({
                    ...current,
                    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, startYear: event.target.value ? Number(event.target.value) : null } : item)
                  }))} />
                  <TextInput type="number" placeholder="End" value={education.endYear ?? ""} onChange={(event) => setProfile((current) => ({
                    ...current,
                    education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, endYear: event.target.value ? Number(event.target.value) : null } : item)
                  }))} />
                  <SecondaryButton type="button" onClick={() => setProfile((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))}>
                    Remove
                  </SecondaryButton>
                </div>
              ))}
            </div>
            <SecondaryButton type="button" onClick={addEducation}>Add Education</SecondaryButton>
          </FieldGroup>

          <FieldGroup title="Certifications" subtitle="Optional certifications improve explainability and can affect ranking.">
            <div className="grid gap-4">
              {profile.certifications.map((certification, index) => (
                <div key={`certification-${index}`} className="grid gap-3 rounded-3xl border border-brand-100 bg-white p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
                  <TextInput placeholder="Certification" value={certification.name} onChange={(event) => setProfile((current) => ({
                    ...current,
                    certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Issuer" value={certification.issuer} onChange={(event) => setProfile((current) => ({
                    ...current,
                    certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, issuer: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Issue date" value={certification.issueDate} onChange={(event) => setProfile((current) => ({
                    ...current,
                    certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, issueDate: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Expiry" value={certification.expirationDate} onChange={(event) => setProfile((current) => ({
                    ...current,
                    certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, expirationDate: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="Credential ID" value={certification.credentialId} onChange={(event) => setProfile((current) => ({
                    ...current,
                    certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, credentialId: event.target.value } : item)
                  }))} />
                  <SecondaryButton type="button" onClick={() => setProfile((current) => ({ ...current, certifications: current.certifications.filter((_, itemIndex) => itemIndex !== index) }))}>
                    Remove
                  </SecondaryButton>
                </div>
              ))}
            </div>
            <SecondaryButton type="button" onClick={addCertification}>Add Certification</SecondaryButton>
          </FieldGroup>

          <FieldGroup title="Availability" subtitle="This supports recruiter planning and contributes to ranking.">
            <div className="grid gap-4 md:grid-cols-3">
              <SelectInput value={profile.availability.status} onChange={(event) => updateAvailability("status", event.target.value)}>
                <option value="">Availability status</option>
                {availabilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </SelectInput>
              <TextInput placeholder="Start date" value={profile.availability.startDate} onChange={(event) => updateAvailability("startDate", event.target.value)} />
              <TextInput placeholder="Notes" value={profile.availability.notes} onChange={(event) => updateAvailability("notes", event.target.value)} />
            </div>
          </FieldGroup>

          <FieldGroup title="Social Links" subtitle="Portfolio and social proof links help the recruiter validate fit quickly.">
            <div className="grid gap-4">
              {profile.socialLinks.map((link, index) => (
                <div key={`social-${index}`} className="grid gap-3 rounded-3xl border border-brand-100 bg-white p-4 md:grid-cols-[0.9fr_1.4fr_auto]">
                  <TextInput placeholder="Platform" value={link.platform} onChange={(event) => setProfile((current) => ({
                    ...current,
                    socialLinks: current.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, platform: event.target.value } : item)
                  }))} />
                  <TextInput placeholder="URL" value={link.url} onChange={(event) => setProfile((current) => ({
                    ...current,
                    socialLinks: current.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item)
                  }))} />
                  <SecondaryButton type="button" onClick={() => setProfile((current) => ({ ...current, socialLinks: current.socialLinks.filter((_, itemIndex) => itemIndex !== index) }))}>
                    Remove
                  </SecondaryButton>
                </div>
              ))}
            </div>
            <SecondaryButton type="button" onClick={addSocialLink}>Add Social Link</SecondaryButton>
          </FieldGroup>
        </>
      )}
    </div>
  );
}
