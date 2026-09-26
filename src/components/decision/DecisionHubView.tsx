import React, { useState } from 'react';
import {
  Lightbulb,
  ShieldAlert,
  School,
  HeartPulse,
  Activity,
  Building2,
  Factory,
  Clock,
  CheckCircle2,
  Download,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Wind,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CityStation } from '../../types/aqi';
import { getAQICategoryInfo } from '../../utils/aqiCalculator';

interface DecisionHubProps {
  station: CityStation;
}

type PersonaType = 'citizens_health' | 'schools_children' | 'athletes_outdoor' | 'city_traffic' | 'industrial';

export const DecisionHubView: React.FC<DecisionHubProps> = ({ station }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('citizens_health');
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  const aqi = Math.round(station.current.pm25 * 2.1);
  const catInfo = getAQICategoryInfo(aqi);
  const isHighRisk = aqi >= 101;
  const isSevere = aqi >= 151;

  const toggleAction = (id: string) => {
    setActionDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Level 3 Persona Data
  const personaActions: Record<
    PersonaType,
    {
      title: string;
      icon: any;
      roleDescription: string;
      urgencyLevel: 'Low' | 'Moderate' | 'High' | 'Emergency';
      expectedExposureReduction: string;
      interventions: Array<{
        id: string;
        action: string;
        impact: string;
        timing: string;
        efficacy: string;
        regulatoryStandard?: string;
      }>;
      operationalProtocol: string;
    }
  > = {
    citizens_health: {
      title: 'Vulnerable Groups & Clinical Health',
      icon: HeartPulse,
      roleDescription: 'Asthma, COPD, cardiovascular patients, infants, and seniors',
      urgencyLevel: isSevere ? 'Emergency' : isHighRisk ? 'High' : 'Moderate',
      expectedExposureReduction: 'Up to 82% personal particulate reduction',
      interventions: [
        {
          id: 'c1',
          action: 'Deploy True-HEPA Air Purifiers with Sealed Enclosure',
          impact: 'Eliminates 99.97% of airborne PM2.5 and fine aerosol particulates.',
          timing: 'Continuous operation in bedrooms & living spaces',
          efficacy: 'High (80-90% drop in indoor PM2.5)',
          regulatoryStandard: 'EN 1822 / CADR Standard 300+',
        },
        {
          id: 'c2',
          action: 'Transition from Surgical Masks to Certified N95 / FFP2 Respirators',
          impact: 'Standard surgical masks leak >60% of PM2.5. N95 seals facial perimeter.',
          timing: 'Prior to leaving indoor sealed micro-environments',
          efficacy: 'Critical (>95% filtration efficiency)',
          regulatoryStandard: 'NIOSH N95 / EN 149 FFP2',
        },
        {
          id: 'c3',
          action: 'Proactive Medical Bronchodilator & Inhaler Readiness',
          impact: 'Airway hyper-reactivity escalates within 30 min of spike exposure.',
          timing: 'Keep fast-acting rescue inhalers accessible',
          efficacy: 'Clinical Preventive Risk Mitigation',
        },
        {
          id: 'c4',
          action: 'Close Outdoor Ventilation Inlets during Nocturnal Thermal Inversion',
          impact: 'Inversion layers trap heavy pollutants nearest the ground between 22:00 and 07:00.',
          timing: '21:30 - 08:00',
          efficacy: 'Medium (Prevents indoor accumulation)',
        },
      ],
      operationalProtocol:
        'Maintain indoor humidity between 40-50% to minimize aerosol suspension. High-risk cardiac patients should avoid strenuous chores.',
    },
    schools_children: {
      title: 'Schools, Nurseries & Educational Campuses',
      icon: School,
      roleDescription: 'Principals, athletics directors, school nurses, and facility managers',
      urgencyLevel: isSevere ? 'Emergency' : isHighRisk ? 'High' : 'Moderate',
      expectedExposureReduction: '70% reduction in pediatric respiratory irritation events',
      interventions: [
        {
          id: 's1',
          action: 'Suspend Outdoor Physical Education (P.E.) & Recess',
          impact: 'Children inhale 2x more air per pound of body weight than adults during exercise.',
          timing: 'Immediate protocol execution',
          efficacy: 'Mandatory Safe Threshold Enforcement',
          regulatoryStandard: 'EPA Air Quality Flag Program (Red/Purple Flag)',
        },
        {
          id: 's2',
          action: 'Relocate Sports Matches to HVAC Filtered Indoor Gymnasium',
          impact: 'Prevents acute exercise-induced asthma attacks and coughing spells.',
          timing: 'Scheduled match windows',
          efficacy: 'High Exposure Reduction',
        },
        {
          id: 's3',
          action: 'Activate School Bus "No-Idle" Loading Zones',
          impact: 'Reduces localized diesel exhaust and ultrafine soot at school gates.',
          timing: 'Morning arrival (07:30–08:30) & Afternoon dismissal (14:30–15:30)',
          efficacy: 'Cuts local gate NO2 by up to 45%',
          regulatoryStandard: 'Clean School Bus USA Protocol',
        },
      ],
      operationalProtocol:
        'Monitor hourly forecast. If AQI projected > 200, initiate hybrid or remote learning protocol per municipal safety bylaws.',
    },
    athletes_outdoor: {
      title: 'Athletes & Outdoor Recreation',
      icon: Activity,
      roleDescription: 'Runners, cyclists, outdoor workers, and fitness clubs',
      urgencyLevel: isSevere ? 'High' : 'Moderate',
      expectedExposureReduction: 'Avoids deep alveolar deposition of ultrafine soot',
      interventions: [
        {
          id: 'a1',
          action: 'Shift Aerobic Cardio to Clean Dispersion Window (14:00 - 16:30)',
          impact: 'Thermal solar heating breaks the morning boundary layer, diluting ground smog.',
          timing: 'Best daily window: 14:00 - 16:30',
          efficacy: '35% lower pollutant inhalation',
        },
        {
          id: 'a2',
          action: 'Avoid Heavy Arterial Roads & Highway Corridors by at least 300 Meters',
          impact: 'Black carbon and NO2 levels decay exponentially beyond 200m from roadways.',
          timing: 'All outdoor transit & exercise',
          efficacy: 'Reduces toxic ultrafine intake by 55%',
        },
        {
          id: 'a3',
          action: 'Switch High-Intensity VO2 Max Interval Workouts to Indoor Treadmills',
          impact: 'High-volume mouth-breathing bypasses natural nasal filtering mechanisms.',
          timing: 'Whenever AQI > 100',
          efficacy: 'Protects endothelial cardiovascular function',
        },
      ],
      operationalProtocol:
        'Athletes experiencing chest tightness or throat burning should immediately terminate exertion and consume antioxidant hydration.',
    },
    city_traffic: {
      title: 'Municipal Traffic & Urban Transit',
      icon: Building2,
      roleDescription: 'City planners, transit operators, and environmental protection agencies',
      urgencyLevel: isSevere ? 'High' : 'Moderate',
      expectedExposureReduction: '18-24% citywide peak traffic emission reduction',
      interventions: [
        {
          id: 't1',
          action: 'Implement Dynamic Heavy-Diesel Truck Diversion Bypasses',
          impact: 'Reroutes non-essential freight around the central commercial core.',
          timing: 'Peak rush hours: 07:00–10:00 and 17:00–20:00',
          efficacy: 'Mitigates localized NO2 and PM10 spikes',
          regulatoryStandard: 'Urban Low-Emission Zone (LEZ) Level 2',
        },
        {
          id: 't2',
          action: 'Increase Metro / Electric Bus Frequency by +25%',
          impact: 'Incentivizes commuters away from single-occupancy gasoline vehicles.',
          timing: 'Morning and evening commute peaks',
          efficacy: 'Lowers commuter carbon and particulate footprint',
        },
        {
          id: 't3',
          action: 'Deploy Municipal Anti-Smog Mist Cannons & Street Sprinklers',
          impact: 'Atomized water droplets bind with suspended PM10 and road dust, accelerating settling.',
          timing: 'High-traffic arterial corridors',
          efficacy: 'Temporary PM10 suppression (15-20%)',
        },
      ],
      operationalProtocol:
        'Coordinate synchronized traffic signal timing to minimize idle-stop emissions on dense urban intersections.',
    },
    industrial: {
      title: 'Industrial Stack & Construction Operations',
      icon: Factory,
      roleDescription: 'Plant engineers, site superintendents, and environmental compliance auditors',
      urgencyLevel: isSevere ? 'Emergency' : 'Moderate',
      expectedExposureReduction: 'Ensures regulatory compliance and avoids shutdown penalties',
      interventions: [
        {
          id: 'i1',
          action: 'Halt Heavy Earthmoving, Excavation & Concrete Demolition',
          impact: 'Suspends primary fugitive dust generation during high inversion hours.',
          timing: 'Effective immediately until wind speed exceeds 3.5 m/s',
          efficacy: 'Stops local PM10 surges at source',
          regulatoryStandard: 'OSHA / EPA Dust Control Standard Rule 403',
        },
        {
          id: 'i2',
          action: 'Activate Wet Dust Scrubbers and Continuous Water Misting Curtains',
          impact: 'Suppresses fugitive particulate dispersion across perimeter boundaries.',
          timing: 'Continuous on perimeter boundaries',
          efficacy: 'Reduces fugitive drift by up to 75%',
        },
        {
          id: 'i3',
          action: 'Curtail Non-Essential Industrial Boiler & Kiln Capacity by 30%',
          impact: 'Lowers sulfur dioxide (SO2) and nitrogen oxides (NOx) primary stack emissions.',
          timing: 'During declared smog alert windows',
          efficacy: 'Critical for regional secondary aerosol abatement',
        },
      ],
      operationalProtocol:
        'Verify continuous opacity monitors and submit telemetry readings to local environmental control boards.',
    },
  };

  const currentPlan = personaActions[selectedPersona];

  return (
    <div className="space-y-6">
      {/* 3-Tier Framework Visual Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Lightbulb className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Level 3 of Analytics Framework
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Actionable Decision Engine & Prescriptive Interventions
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Converting Level 1 sensor analytics and Level 2 LightGBM predictions into evidence-based operational decisions for institutions, clinicians, and municipalities.
            </p>
          </div>

          {/* Framework Level Indicator Badges */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              L1: Analytics
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              L2: Prediction
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold shadow-sm">
              L3: Decision Engine
            </span>
          </div>
        </div>
      </div>

      {/* Target Station Context Strip */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border shadow-inner"
            style={{
              backgroundColor: `${catInfo.color}15`,
              borderColor: `${catInfo.color}40`,
              color: catInfo.color,
            }}
          >
            {aqi}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{station.city} Sensor Grid</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
              >
                {catInfo.category}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Primary Driver: PM2.5 at {station.current.pm25} µg/m³ ({Math.round(station.current.pm25 / 15)}x WHO 24h limit)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Wind: {station.current.windSpeed} m/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Clean Window: 14:00 - 17:00</span>
          </div>
        </div>
      </div>

      {/* Persona Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(
          [
            { id: 'citizens_health', label: 'Health & Seniors', icon: HeartPulse },
            { id: 'schools_children', label: 'Schools & Campuses', icon: School },
            { id: 'athletes_outdoor', label: 'Athletes & Sports', icon: Activity },
            { id: 'city_traffic', label: 'City & Traffic', icon: Building2 },
            { id: 'industrial', label: 'Industry & Sites', icon: Factory },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedPersona === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedPersona(tab.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-200 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
              </div>
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Prescriptive Decision Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Actionable Protocol Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <currentPlan.icon className="w-5 h-5 text-purple-400" />
                  {currentPlan.title}
                </h3>
                <p className="text-xs text-slate-400">{currentPlan.roleDescription}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    currentPlan.urgencyLevel === 'Emergency'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : currentPlan.urgencyLevel === 'High'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}
                >
                  Urgency: {currentPlan.urgencyLevel}
                </span>
              </div>
            </div>

            {/* Interactive Interventions List */}
            <div className="space-y-3">
              {currentPlan.interventions.map((item) => {
                const isChecked = !!actionDone[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAction(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-700 bg-slate-900 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.action}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/30">
                            {item.efficacy}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-2">{item.impact}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
                          <span className="flex items-center gap-1 text-amber-400/90">
                            <Clock className="w-3 h-3" />
                            {item.timing}
                          </span>
                          {item.regulatoryStandard && (
                            <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                              Standard: {item.regulatoryStandard}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Decision Impact & Operational Summary */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Projected Mitigation Yield
            </h4>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Target Risk Reduction</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {currentPlan.expectedExposureReduction}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Adhering to these Level 3 interventions decouples indoor exposure from raw outdoor atmospheric surges.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Standing Standard Operating Procedure (SOP)
              </span>
              <p className="text-xs text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {currentPlan.operationalProtocol}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const content = `AEROPULSE LEVEL 3 DECISION BRIEF\nStation: ${station.city}\nDate: ${new Date().toISOString()}\nAQI: ${aqi} (${catInfo.category})\nTarget Persona: ${currentPlan.title}\nReduction Target: ${currentPlan.expectedExposureReduction}\n\nInterventions:\n${currentPlan.interventions.map((i, idx) => `${idx + 1}. [${i.action}] - ${i.impact} (Timing: ${i.timing})`).join('\n')}\n\nProtocol: ${currentPlan.operationalProtocol}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `AeroPulse_L3_Decision_Brief_${station.city.toLowerCase()}_${selectedPersona}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                Export Level 3 Operational Brief
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
