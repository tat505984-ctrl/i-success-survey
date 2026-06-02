import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  Search, 
  FileText, 
  Sparkles, 
  RefreshCw,
  Info,
  LineChart,
  Lock,
  ChevronRight,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // --- 상태 정의 ---
  const [currentTab, setCurrentTab] = useState('welcome'); // 'welcome', 'survey', 'teacher'
  const [teacherSubTab, setTeacherSubTab] = useState('dashboard'); // 'dashboard', 'charts', 'ttest', 'data'
  const [responses, setResponses] = useState([]);
  
  // 설문 상태
  const [surveyStep, setSurveyStep] = useState('info'); // 'info', 'questions', 'complete'
  const [surveyForm, setSurveyForm] = useState({
    grade: '6',
    classGroup: '',
    number: '',
    name: '',
    phase: 'pre' // 'pre' (사전), 'post' (사후)
  });
  
  const [surveyAnswers, setSurveyAnswers] = useState({
    1: null, 2: null, 3: null, 4: null,
    5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null
  });

  // 검색/필터 상태
  const [searchName, setSearchName] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');

  // 교사 모드 비밀번호 단순 인증용 (기본값 false, 원할 때 활성화 가능)
  const [isTeacherLocked, setIsTeacherLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  // 알림 토스트 메시지 상태
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- 문항 데이터 ---
  const questions = [
    { id: 1, domain: 1, text: "나는 사회 수업 시간에 아무리 어렵고 복잡한 탐구 과제가 주어져도 끝까지 스스로 해결할 수 있다." },
    { id: 2, domain: 1, text: "나는 세계 여러 나라에 대해 조사하고 발표하는 등의 깊이 있는 탐구 활동이 주어질 때 더 흥미를 느낀다." },
    { id: 3, domain: 1, text: "나는 강원아이로(AI-RO)나 에듀테크 도구를 활용하여 사회과 문제를 해결하는 데 남다른 자신감이 있다." },
    { id: 4, domain: 1, text: "탐구 활동 중에 예상치 못한 문제가 생겨도, 나는 이를 해결할 방법을 찾아낼 수 " },
    { id: 5, domain: 2, text: "나는 사회과 세계 여행 탐구 활동을 시작하기 전에 내가 무엇을 어떻게 조사해야 할지 먼저 계획을 세운다." },
    { id: 6, domain: 2, text: "나는 강원아이로(AI-RO)나 인터넷에서 찾아낸 정보들이 탐구 주제에 정말 맞고 믿을 만한 것인지 꼼꼼히 확인한다." },
    { id: 7, domain: 2, text: "나는 디지털 도구나 플랫폼을 활용해 공부하다가 잘 모르는 부분이 생기면 친구나 선생님에게 적극적으로 도움을 구한다." },
    { id: 8, domain: 2, text: "나는 모둠 친구들과 함께 디지털 공간에서 의견을 나누고 역할을 나누어 협동하는 과정을 잘 조절할 수 있다." },
    { id: 9, domain: 3, text: "사회 수업에서 새로운 디지털 도구나 에듀테크 기능을 배우는 과정이 처음에는 어렵더라도, 노력하면 얼마든지 익숙해질 수 있다고 생각한다." },
    { id: 10, domain: 3, text: "탐구 과제를 하다가 내 생각대로 잘 풀리지 않거나 실수를 하더라도, 그것을 통해 나의 탐구 능력이 더 자라난다고 믿는다." },
    { id: 11, domain: 3, text: "나의 사회과 탐구 능력과 지식은 고정되어 있는 것이 아니라, 내가 열심히 참여하고 탐구할수록 계속해서 향상될 수 있다." }
  ];

  // 영역 매핑 정보
  const domainNames = {
    1: { title: "학업적 자기효능감", desc: "성공 경험 및 자신감", questions: [1, 2, 3, 4], color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    2: { title: "자기조절학습 능력", desc: "주도적 탐구 과정", questions: [5, 6, 7, 8], color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    3: { title: "성장 마인드셋", desc: "시행착오를 통한 성장", questions: [9, 10, 11], color: "text-amber-600 bg-amber-50 border-amber-200" }
  };

  // --- 초기 로드 및 저장 ---
  useEffect(() => {
    const saved = localStorage.getItem('i_success_survey_data');
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
      } catch (e) {
        console.error("데이터 로드 오류", e);
      }
    }
  }, []);

  const saveToLocalStorage = (data) => {
    localStorage.setItem('i_success_survey_data', JSON.stringify(data));
  };

  // 알림 토스트 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // --- 설문 관련 함수 ---
  const handleStartSurvey = (e) => {
    e.preventDefault();
    if (!surveyForm.classGroup || !surveyForm.number || !surveyForm.name) {
      showToast("반, 번호, 이름을 모두 입력해주세요.", "error");
      return;
    }
    setSurveyAnswers({
      1: null, 2: null, 3: null, 4: null,
      5: null, 6: null, 7: null, 8: null,
      9: null, 10: null, 11: null
    });
    setSurveyStep('questions');
  };

  const handleSelectAnswer = (qId, val) => {
    setSurveyAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSurveySubmit = () => {
    // 모든 문항에 답했는지 확인
    const unanswered = Object.keys(surveyAnswers).filter(k => surveyAnswers[k] === null);
    if (unanswered.length > 0) {
      showToast(`아직 답변하지 않은 문항이 있습니다. (${unanswered.join(', ')}번)`, "error");
      return;
    }

    const newResponse = {
      id: Date.now().toString(),
      grade: surveyForm.grade,
      classGroup: surveyForm.classGroup.trim(),
      number: surveyForm.number.trim(),
      name: surveyForm.name.trim(),
      phase: surveyForm.phase,
      answers: { ...surveyAnswers },
      date: new Date().toLocaleDateString()
    };

    const updatedResponses = [...responses];
    const existingIndex = updatedResponses.findIndex(r => 
      r.grade === newResponse.grade &&
      r.classGroup === newResponse.classGroup &&
      r.number === newResponse.number &&
      r.name === newResponse.name &&
      r.phase === newResponse.phase
    );

    if (existingIndex > -1) {
      updatedResponses[existingIndex] = newResponse;
      showToast("동일한 대상의 데이터가 있어 기존 답변이 최신 답변으로 갱신되었습니다.", "info");
    } else {
      updatedResponses.push(newResponse);
      showToast("설문 답변이 성공적으로 기록되었습니다!");
    }

    setResponses(updatedResponses);
    saveToLocalStorage(updatedResponses);
    setSurveyStep('complete');
  };

  const resetSurveyForm = () => {
    setSurveyForm(prev => ({ ...prev, number: '', name: '' }));
    setSurveyStep('info');
    setCurrentTab('welcome');
  };

  // --- 가상 데이터 자동 생성 기능 ---
  const handleGenerateMockData = () => {
    const mockNames = ["김하준", "이서윤", "박지우", "최민준", "정서현", "강예준", "조수아", "윤도윤", "장서준", "임지민", "한은우", "오지유", "서우진", "신채원", "권지혁", "황하율", "송민재", "전다은", "홍준서", "유수빈"];
    const generated = [];
    const dateStr = new Date().toLocaleDateString();

    mockNames.forEach((name, idx) => {
      const studentNum = (idx + 1).toString();
      const preAnswers = {};
      const postAnswers = {};

      for (let q = 1; q <= 4; q++) {
        preAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 2));
        postAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 2) + 4));
      }
      for (let q = 5; q <= 8; q++) {
        preAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 2));
        postAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 2) + 4));
      }
      for (let q = 9; q <= 11; q++) {
        preAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 3));
        postAnswers[q] = Math.max(1, Math.min(5, Math.floor(Math.random() * 2) + 4));
        if (Math.random() > 0.3) postAnswers[q] = 5;
      }

      generated.push({
        id: `mock-pre-${idx}`,
        grade: '6',
        classGroup: '1',
        number: studentNum,
        name: name,
        phase: 'pre',
        answers: preAnswers,
        date: dateStr
      });

      generated.push({
        id: `mock-post-${idx}`,
        grade: '6',
        classGroup: '1',
        number: studentNum,
        name: name,
        phase: 'post',
        answers: postAnswers,
        date: dateStr
      });
    });

    setResponses(generated);
    saveToLocalStorage(generated);
    showToast("6학년 1반 20명의 사전/사후 가상 데이터(성공 모델)가 자동 생성되었습니다!");
  };

  const handleClearData = () => {
    if (window.confirm("정말로 모든 설문 데이터를 삭제하시겠습니까? 복구할 수 없습니다.")) {
      setResponses([]);
      localStorage.removeItem('i_success_survey_data');
      showToast("모든 데이터가 삭제되었습니다.", "info");
    }
  };

  const handleDeleteResponse = (id) => {
    const updated = responses.filter(r => r.id !== id);
    setResponses(updated);
    saveToLocalStorage(updated);
    showToast("선택한 설문 데이터가 삭제되었습니다.", "info");
  };

  // --- CSV 내보내기 및 가져오기 ---
  const handleExportCSV = () => {
    if (responses.length === 0) {
      showToast("내보낼 데이터가 없습니다.", "error");
      return;
    }

    let csvContent = "\ufeff";
    csvContent += "구분,학년,반,번호,이름,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,학업적자기효능감평균,자기조절학습평균,성장마인드셋평균,전체평균\n";

    responses.forEach(r => {
      const a = r.answers;
      const d1Avg = ((a[1]+a[2]+a[3]+a[4])/4).toFixed(2);
      const d2Avg = ((a[5]+a[6]+a[7]+a[8])/4).toFixed(2);
      const d3Avg = ((a[9]+a[10]+a[11])/3).toFixed(2);
      const totalAvg = ((Object.values(a).reduce((sum, v) => sum + v, 0)) / 11).toFixed(2);

      csvContent += `${r.phase === 'pre' ? '사전' : '사후'},${r.grade},${r.classGroup},${r.number},${r.name},${a[1]},${a[2]},${a[3]},${a[4]},${a[5]},${a[6]},${a[7]},${a[8]},${a[9]},${a[10]},${a[11]},${d1Avg},${d2Avg},${d3Avg},${totalAvg}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `사회과_탐구_디지털_학습성향_설문결과_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n");
      const imported = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",");
        if (cols.length < 16) continue;

        const phase = cols[0].trim() === '사전' ? 'pre' : 'post';
        const grade = cols[1].trim();
        const classGroup = cols[2].trim();
        const number = cols[3].trim();
        const name = cols[4].trim();

        const answers = {};
        for (let q = 1; q <= 11; q++) {
          answers[q] = parseInt(cols[4 + q]?.trim()) || 3;
        }

        imported.push({
          id: `imported-${Date.now()}-${i}`,
          grade,
          classGroup,
          number,
          name,
          phase,
          answers,
          date: new Date().toLocaleDateString()
        });
      }

      if (imported.length > 0) {
        const merged = [...responses, ...imported];
        setResponses(merged);
        saveToLocalStorage(merged);
        showToast(`${imported.length}건의 설문 데이터를 성공적으로 가져왔습니다!`);
      } else {
        showToast("유효한 데이터를 찾지 못했습니다. 파일 구조를 확인해주세요.", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // --- 통계 가공 함수군 ---
  const getPhaseStats = (phase) => {
    const filtered = responses.filter(r => r.phase === phase);
    const count = filtered.length;
    if (count === 0) return { count: 0, d1: 0, d2: 0, d3: 0, total: 0 };

    let d1Sum = 0, d2Sum = 0, d3Sum = 0, totalSum = 0;
    filtered.forEach(r => {
      const a = r.answers;
      d1Sum += (a[1] + a[2] + a[3] + a[4]) / 4;
      d2Sum += (a[5] + a[6] + a[7] + a[8]) / 4;
      d3Sum += (a[9] + a[10] + a[11]) / 3;
      totalSum += Object.values(a).reduce((sum, v) => sum + v, 0) / 11;
    });

    return {
      count,
      d1: parseFloat((d1Sum / count).toFixed(2)),
      d2: parseFloat((d2Sum / count).toFixed(2)),
      d3: parseFloat((d3Sum / count).toFixed(2)),
      total: parseFloat((totalSum / count).toFixed(2))
    };
  };

  const preStats = getPhaseStats('pre');
  const postStats = getPhaseStats('post');

  const getQuestionAverage = (qId, phase) => {
    const filtered = responses.filter(r => r.phase === phase);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, r) => acc + (r.answers[qId] || 0), 0);
    return parseFloat((sum / filtered.length).toFixed(2));
  };

  // --- 대응표본 t-검정 계산 함수 ---
  const getPairedData = () => {
    const preUsers = responses.filter(r => r.phase === 'pre');
    const postUsers = responses.filter(r => r.phase === 'post');

    const paired = [];
    preUsers.forEach(pre => {
      const match = postUsers.find(post => 
        post.grade === pre.grade &&
        post.classGroup === pre.classGroup &&
        post.number === pre.number &&
        post.name === pre.name
      );
      if (match) {
        paired.push({
          info: { grade: pre.grade, classGroup: pre.classGroup, number: pre.number, name: pre.name },
          pre: pre.answers,
          post: match.answers
        });
      }
    });
    return paired;
  };

  const pairedData = getPairedData();

  const calculatePairedTTest = (domainId) => {
    if (pairedData.length < 2) return null;

    const n = pairedData.length;
    let diffs = [];

    pairedData.forEach(pair => {
      let preAvg = 0, postAvg = 0;
      if (domainId === 'total') {
        preAvg = Object.values(pair.pre).reduce((s, v) => s + v, 0) / 11;
        postAvg = Object.values(pair.post).reduce((s, v) => s + v, 0) / 11;
      } else {
        const qIds = domainNames[domainId].questions;
        preAvg = qIds.reduce((s, id) => s + pair.pre[id], 0) / qIds.length;
        postAvg = qIds.reduce((s, id) => s + pair.post[id], 0) / qIds.length;
      }
      diffs.push(postAvg - preAvg);
    });

    const meanDiff = diffs.reduce((sum, d) => sum + d, 0) / n;
    const variance = diffs.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);

    if (se === 0) return { t: 0, p: 1, df: n - 1, meanDiff: 0, sd: 0, se: 0, significant: false };

    const t = meanDiff / se;
    const df = n - 1;

    const absT = Math.abs(t);
    const z = absT * (1 - 1 / (4 * df));
    const erfc = (val) => {
      const p = 0.3275911;
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const t_val = 1.0 / (1.0 + p * val);
      return (a1*t_val + a2*Math.pow(t_val,2) + a3*Math.pow(t_val,3) + a4*Math.pow(t_val,4) + a5*Math.pow(t_val,5)) * Math.exp(-val*val);
    };
    let p = erfc(z / Math.sqrt(2));

    if (p < 0.001) p = 0.001;
    if (p > 1) p = 1;

    return {
      t: parseFloat(t.toFixed(3)),
      p: parseFloat(p.toFixed(4)),
      df,
      meanDiff: parseFloat(meanDiff.toFixed(3)),
      sd: parseFloat(sd.toFixed(3)),
      se: parseFloat(se.toFixed(3)),
      significant: p < 0.05
    };
  };

  const tTestD1 = calculatePairedTTest(1);
  const tTestD2 = calculatePairedTTest(2);
  const tTestD3 = calculatePairedTTest(3);
  const tTestTotal = calculatePairedTTest('total');

  // --- 학술적 보고서 기술 문안 생성기 ---
  const generateAcademicText = () => {
    if (pairedData.length < 2) return "분석을 실행하기 위한 사전-사후 매칭 학생 데이터가 부족합니다. 최소 2명 이상의 동일 학생 사전/사후 데이터를 등록해 주세요.";

    const n = pairedData.length;
    let text = `본 연구에서는 강원아이로(AI-RO) 및 디지털 에듀테크 도구를 활용한 초등학교 6학년 사회과 탐구 중심 프로젝트가 학생들의 정의적·디지털 학습 성향에 미치는 효과를 검증하기 위해 대응표본 t-검정(Paired t-test)을 실시하였다. 분석 대상은 사전 검사와 사후 검사와 일대일 매칭이 완료된 총 ${n}명의 학생이다.\n\n`;

    const addDomainReport = (name, testResult, statsPre, statsPost) => {
      if (!testResult) return '';
      const sigText = testResult.significant 
        ? `통계적으로 유의미한 수준에서 향상된 것으로 나타났다(t(${testResult.df}) = ${testResult.t}, p < ${testResult.p === 0.001 ? '.001' : testResult.p}).`
        : `통계적으로 유의미한 차이가 발견되지 않았다(t(${testResult.df}) = ${testResult.t}, p = ${testResult.p}).`;

      return `첫째, [${name}] 영역의 경우 프로젝트 적용 전 평균 ${statsPre.toFixed(2)}점에서 적용 후 평균 ${statsPost.toFixed(2)}점으로 약 ${(statsPost - statsPre).toFixed(2)}점 상승하였으며, 이는 ${sigText}\n\n`;
    };

    text += addDomainReport("학업적 자기효능감", tTestD1, preStats.d1, postStats.d1);
    text += addDomainReport("자기조절학습 능력", tTestD2, preStats.d2, postStats.d2);
    text += addDomainReport("성장 마인드셋", tTestD3, preStats.d3, postStats.d3);

    const overallSig = tTestTotal?.significant 
      ? `유의미한 성장을 보였다(t(${tTestTotal.df}) = ${tTestTotal.t}, p < ${tTestTotal.p === 0.001 ? '.001' : tTestTotal.p}).`
      : `통계적으로 유의미한 전체 변화는 발견되지 않았다.`;

    text += `결과적으로, 전체 탐구 및 디지털 학습 성향 종합 평균 또한 사전 ${preStats.total.toFixed(2)}점에서 사후 ${postStats.total.toFixed(2)}점으로 상승하여 ${overallSig} 이는 디지털 에듀테크 환경 속에서 학생들이 시행착오를 두려워하지 않고 주도적으로 지식을 재구성하며, "나도 할 수 있다"는 강력한 학업 성공 경험을 체득했음을 뒷받침한다.`;

    return text;
  };

  const handleTeacherAccess = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === '1234') {
      setIsTeacherLocked(false);
      setPassError('');
    } else {
      setPassError('비밀번호가 일치하지 않습니다. (테스트용 비번: 1234)');
    }
  };

  const filteredResponses = responses.filter(r => {
    const matchesName = r.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesPhase = filterPhase === 'all' ? true : r.phase === filterPhase;
    return matchesName && matchesPhase;
  }).sort((a,b) => {
    if (a.classGroup !== b.classGroup) return a.classGroup.localeCompare(b.classGroup);
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    if (numA !== numB) return numA - numB;
    return a.phase.localeCompare(b.phase);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('welcome')}>
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">I-Success Journey</span>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">사회과 탐구 & 디지털 학습 성향 설문</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setCurrentTab('survey');
                setSurveyStep('info');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'survey' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📝 설문 참여
            </button>
            <button 
              onClick={() => {
                setCurrentTab('teacher');
                setIsTeacherLocked(false);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'teacher' 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-300' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📊 교사용 분석기
            </button>
          </div>
        </div>
      </header>

      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-2xl transition-all duration-500 bg-white border border-slate-150 animate-bounce">
          <div className={`mr-3 p-2 rounded-lg ${toast.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
            {toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div className="text-sm font-bold text-slate-800">{toast.message}</div>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {currentTab === 'welcome' && (
          <div className="space-y-8 py-4 sm:py-8">
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-12">
                <Award className="h-96 w-96" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-emerald-500/30 text-emerald-100 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-400/20">
                  <Sparkles className="h-3 w-3" /> 6학년 사회과 연구대회 완벽 지원
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  배움과 디지털 성장 여정,<br/>
                  <span className="text-emerald-300">I-Success Journey</span>에 오신 것을 환영합니다!
                </h2>
                <p className="text-emerald-50 text-sm sm:text-base leading-relaxed font-medium">
                  본 프로그램은 학생들이 프로젝트 학습 과정에서 겪는 정의적 변화와 디지털 도구 활용 역량의 성장을 진단하고 분석합니다. 수집된 사전·사후 데이터를 바탕으로 학술 논문 및 연구 보고서에 바로 활용할 수 있는 과학적 분석 결과를 즉시 제공합니다.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => { setCurrentTab('survey'); setSurveyStep('info'); }}
                    className="bg-white text-emerald-900 hover:bg-emerald-50 transition font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    설문 시작하기 <ArrowRight className="h-5 w-5 text-emerald-700" />
                  </button>
                  <button 
                    onClick={() => setCurrentTab('teacher')}
                    className="bg-emerald-800/40 text-emerald-50 hover:bg-emerald-800/60 border border-emerald-500/30 transition font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2"
                  >
                    📊 교사용 관리 도구 바로가기
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> 설문 측정 영역 및 목적
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(domainNames).map(([id, dom]) => (
                  <div key={id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg border uppercase ${dom.color}`}>
                        영역 {id}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">문항 {id === '3' ? '9~11번' : `${(parseInt(id)-1)*4+1}~${parseInt(id)*4}번`}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{dom.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold mb-3">{dom.desc}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {id === '1' && "학생들이 도전적 과제를 두려워하지 않고 디지털 환경에서 '스스로 해낼 수 있다'는 자신감과 성공 경험을 가졌는지 측정합니다."}
                      {id === '2' && "계획 수립부터 디지털 도구 활용 정보 검증, 동료와의 온라인 소통 및 자원 관리를 스스로 조절하는지 측정합니다."}
                      {id === '3' && "실수와 시행착오를 성장의 디딤돌로 삼아, 자신의 탐구 역량을 계속하여 확장할 수 있다고 믿는지 측정합니다."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="h-4 w-4" /> 실시간 통계 및 Paired t-Test 탑재
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-white">보고서 작성 시간이 획기적으로 단축됩니다</h4>
                <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  번거로운 SPSS나 엑셀 수식 작업 없이 사전·사후 조사 결과가 업로드되면 자동으로 영역별 평균 변화 계산, 그래프 작성 및 논문 통계 규격에 맞춘 대응표본 t-검정 값과 p-value를 계산하여 텍스트로 보고서를 완성해 줍니다.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <button 
                  onClick={handleGenerateMockData}
                  className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 transition-all text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5 animate-spin" /> 테스트용 가상 데이터 생성하기
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">20명 분량의 사전/사후 성공 결과가 즉시 채워집니다.</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'survey' && (
          <div className="max-w-3xl mx-auto py-4">
            
            {surveyStep === 'info' && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 text-white p-6 sm:p-8 relative">
                  <div className="absolute top-4 right-4 opacity-10">
                    <ClipboardCheck className="h-24 w-24" />
                  </div>
                  <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400">
                    Student Portal
                  </span>
                  <h3 className="text-2xl font-black mt-2">학생 정보 및 조사 구분 입력</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                    정확한 사전/사후 성향 변화 측정을 위해 반, 번호, 이름을 바르게 적어주세요.
                  </p>
                </div>

                <form onSubmit={handleStartSurvey} className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">대상 학년</label>
                      <input 
                        type="text" 
                        value="6학년" 
                        disabled 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl px-4 py-3.5 text-sm font-extrabold cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">반 입력</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="예: 1" 
                          min="1" 
                          max="20"
                          required
                          value={surveyForm.classGroup} 
                          onChange={(e) => setSurveyForm(prev => ({ ...prev, classGroup: e.target.value }))}
                          className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-extrabold text-slate-400">반</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">번호 입력</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="예: 7" 
                          min="1" 
                          max="40"
                          required
                          value={surveyForm.number} 
                          onChange={(e) => setSurveyForm(prev => ({ ...prev, number: e.target.value }))}
                          className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-extrabold text-slate-400">번</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">이름 입력</label>
                      <input 
                        type="text" 
                        placeholder="이름을 입력하세요" 
                        required
                        value={surveyForm.name} 
                        onChange={(e) => setSurveyForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">설문 참여 차수 선택</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSurveyForm(prev => ({ ...prev, phase: 'pre' }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          surveyForm.phase === 'pre'
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-md'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="block text-xs font-black uppercase text-emerald-600">Phase 1</span>
                        <span className="block text-lg font-black mt-1">프로젝트 시작 전 (사전)</span>
                        <span className="block text-xs mt-1 text-slate-500">배움을 시작하기 전 내 생각을 알려줘요.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSurveyForm(prev => ({ ...prev, phase: 'post' }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          surveyForm.phase === 'post'
                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-md'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="block text-xs font-black uppercase text-indigo-600">Phase 2</span>
                        <span className="block text-lg font-black mt-1">프로젝트 완료 후 (사후)</span>
                        <span className="block text-xs mt-1 text-slate-500">프로젝트를 마친 후 내 변화를 측정해요.</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-slate-950 text-white hover:bg-slate-900 transition-all font-extrabold px-8 py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                      설문 문항으로 넘어가기 <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {surveyStep === 'questions' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-md">
                        {surveyForm.grade}학년 {surveyForm.classGroup}반 {surveyForm.number}번
                      </span>
                      <span className="font-extrabold text-slate-900">{surveyForm.name} 학생</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">
                      설문지 구분: <span className="text-emerald-600 font-bold">{surveyForm.phase === 'pre' ? '프로젝트 시작 전 (사전)' : '프로젝트 완료 후 (사후)'}</span>
                    </p>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="text-xs text-slate-400 font-bold mb-1">설문 진행 상황</div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-32 bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all" 
                          style={{ width: `${(Object.values(surveyAnswers).filter(x => x !== null).length / 11) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-black text-slate-700">
                        {Object.values(surveyAnswers).filter(x => x !== null).length} / 11
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {questions.map((q, idx) => {
                    const domain = domainNames[q.domain];
                    const isFirstInDomain = idx === 0 || questions[idx - 1].domain !== q.domain;

                    return (
                      <div key={q.id} className="space-y-4">
                        {isFirstInDomain && (
                          <div className={`p-4 rounded-2xl border-l-4 ${q.domain === 1 ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950' : q.domain === 2 ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950' : 'border-amber-500 bg-amber-50/20 text-amber-950'}`}>
                            <span className="text-xs font-black tracking-widest uppercase block opacity-70">영역 {q.domain}</span>
                            <span className="text-lg font-black">{domain.title}</span>
                            <span className="text-xs font-semibold block mt-0.5 opacity-80">{domain.desc}</span>
                          </div>
                        )}

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition duration-150">
                          <div className="flex items-start gap-3">
                            <span className="bg-slate-100 text-slate-700 font-black h-7 w-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                              {q.id}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 leading-relaxed pt-0.5">
                              {q.text}
                            </h4>
                          </div>

                          <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-6">
                            {[1, 2, 3, 4, 5].map((score) => {
                              const labels = {
                                1: "전혀 아니다",
                                2: "아니다",
                                3: "보통이다",
                                4: "그렇다",
                                5: "매우 그렇다"
                              };
                              const isSelected = surveyAnswers[q.id] === score;

                              return (
                                <button
                                  key={score}
                                  type="button"
                                  onClick={() => handleSelectAnswer(q.id, score)}
                                  className={`p-2.5 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                    isSelected
                                      ? q.domain === 1 
                                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                                        : q.domain === 2
                                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                          : 'border-amber-500 bg-amber-500 text-white shadow-md'
                                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                                  }`}
                                >
                                  <span className="text-lg sm:text-xl font-black mb-1">{score}</span>
                                  <span className={`text-[10px] font-semibold text-center leading-tight ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                                    {labels[score]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setSurveyStep('info')}
                    className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-6 py-4 rounded-2xl transition"
                  >
                    이전 정보수정
                  </button>
                  <button
                    type="button"
                    onClick={handleSurveySubmit}
                    className="flex-grow sm:flex-grow-0 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    설문 완료하고 결과 제출하기 <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {surveyStep === 'complete' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto space-y-6">
                <div className="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">소중한 답변이 제출되었습니다!</h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    사회 수업에서의 배움과 디지털 활용에 대한 솔직한 생각을 응답해 주어 감사해요. 여러분의 답변은 새로운 성장의 길을 밝히는 중요한 나침반이 됩니다.
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl text-left border border-emerald-100">
                  <div className="text-xs text-emerald-800 font-black mb-1">제출 완료 내역</div>
                  <div className="text-sm text-slate-700 font-semibold space-y-0.5">
                    <div>• 학생명: <span className="font-bold text-slate-900">{surveyForm.name}</span></div>
                    <div>• 구분: <span className="font-bold text-slate-900">{surveyForm.phase === 'pre' ? '사전 (프로젝트 시작 전)' : '사후 (프로젝트 완료 후)'}</span></div>
                    <div>• 일시: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  onClick={resetSurveyForm}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white transition font-bold px-6 py-4 rounded-2xl"
                >
                  홈으로 이동하기
                </button>
              </div>
            )}

          </div>
        )}

        {currentTab === 'teacher' && (
          <div className="space-y-6">
            
            {isTeacherLocked ? (
              <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="flex justify-center">
                  <div className="bg-slate-100 text-slate-900 p-4 rounded-full">
                    <Lock className="h-10 w-10" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">교사 인증이 필요합니다</h3>
                  <p className="text-xs text-slate-400 font-bold">대시보드를 확인하기 위해 관리 비밀번호를 입력해 주세요.</p>
                </div>
                <form onSubmit={handleTeacherAccess} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      placeholder="비밀번호 입력 (기본: 1234)" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-center focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    />
                    {passError && <p className="text-xs font-bold text-red-500 text-center mt-2">{passError}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white transition font-bold py-3.5 rounded-2xl"
                  >
                    인증하기
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-black text-indigo-600 tracking-widest uppercase">Admin Dashboard</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">교사용 통계 분석 및 데이터 포털</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={handleGenerateMockData}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> 테스트 가상 데이터 20쌍 생성
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-100 transition flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> 엑셀(CSV) 다운로드
                    </button>
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 cursor-pointer transition flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> CSV 가져오기
                      <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                    </label>
                    <button 
                      onClick={handleClearData}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> 전체 삭제
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
                  <button
                    onClick={() => setTeacherSubTab('dashboard')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                      teacherSubTab === 'dashboard'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="h-4 w-4" /> 데이터 모니터링
                  </button>
                  <button
                    onClick={() => setTeacherSubTab('charts')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                      teacherSubTab === 'charts'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" /> 영역별 비교 차트
                  </button>
                  <button
                    onClick={() => setTeacherSubTab('ttest')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                      teacherSubTab === 'ttest'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" /> 대응표본 t-test 분석기
                  </button>
                  <button
                    onClick={() => setTeacherSubTab('data')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                      teacherSubTab === 'data'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Database className="h-4 w-4" /> 개별 학생 데이터 관리 ({responses.length}건)
                  </button>
                </div>

                {teacherSubTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">누적 수집 데이터</p>
                            <h4 className="text-3xl font-black text-slate-900 mt-1">{responses.length}건</h4>
                          </div>
                          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                            <Database className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-3 font-semibold">
                          사전: <span className="font-bold text-emerald-600">{preStats.count}건</span> | 사후: <span className="font-bold text-indigo-600">{postStats.count}건</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">일대일 매칭 완료 수</p>
                            <h4 className="text-3xl font-black text-indigo-600 mt-1">{pairedData.length}명</h4>
                          </div>
                          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                            <Users className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="text-xs text-indigo-500 mt-3 font-semibold">
                          사전 및 사후가 매칭된 t-test 분석 대상
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">사전 종합 평균</p>
                            <h4 className="text-3xl font-black text-slate-800 mt-1">{preStats.total > 0 ? preStats.total.toFixed(2) : '-'}</h4>
                          </div>
                          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-3 font-semibold">
                          사전 배움 설계 단계의 성향 수치
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">사후 종합 평균</p>
                            <h4 className="text-3xl font-black text-emerald-600 mt-1">
                              {postStats.total > 0 ? postStats.total.toFixed(2) : '-'}
                              {postStats.total > 0 && preStats.total > 0 && (
                                <span className="text-xs font-bold text-emerald-600 ml-1.5">
                                  (+{(postStats.total - preStats.total).toFixed(2)})
                                </span>
                              )}
                            </h4>
                          </div>
                          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-800">
                            <LineChart className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="text-xs text-emerald-600 mt-3 font-bold">
                          프로젝트 완수 후 인지적 성장 지표
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-600" /> 세부 영역별 사전 vs 사후 평균 비교
                      </h3>
                      {responses.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-bold">
                          수집된 데이터가 없습니다. 학생용 설문을 진행하거나 우측 상단의 '테스트 가상 데이터 생성' 버튼을 클릭해 주세요.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {Object.entries(domainNames).map(([id, dom]) => {
                            const preVal = preStats[`d${id}`] || 0;
                            const postVal = postStats[`d${id}`] || 0;
                            const prePercent = (preVal / 5) * 100;
                            const postPercent = (postVal / 5) * 100;
                            const growth = (postVal - preVal).toFixed(2);

                            return (
                              <div key={id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">영역 {id}</span>
                                  <h4 className="text-base font-extrabold text-slate-900">{dom.title}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">{dom.desc}</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                      <span>사전 (Pre)</span>
                                      <span>{preVal > 0 ? `${preVal.toFixed(2)} 점` : '데이터 없음'}</span>
                                    </div>
                                    <div className="w-full bg-slate-200/60 rounded-full h-3">
                                      <div 
                                        className="bg-slate-400 h-3 rounded-full transition-all duration-500" 
                                        style={{ width: `${prePercent}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-xs font-black text-emerald-700 mb-1">
                                      <span>사후 (Post)</span>
                                      <span>{postVal > 0 ? `${postVal.toFixed(2)} 점` : '데이터 없음'}</span>
                                    </div>
                                    <div className="w-full bg-emerald-100 rounded-full h-3">
                                      <div 
                                        className="bg-emerald-600 h-3 rounded-full transition-all duration-500" 
                                        style={{ width: `${postPercent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {postVal > 0 && preVal > 0 && (
                                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-semibold">프로젝트 효과성 성장도</span>
                                    <span className={`font-black px-2.5 py-0.5 rounded-full ${parseFloat(growth) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                      {parseFloat(growth) >= 0 ? `+${growth}` : growth} 점 상승
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {teacherSubTab === 'charts' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">문항별 상세 평균 분포 차트</h3>
                      <p className="text-xs text-slate-400 mt-1 font-bold">1번부터 11번 문항까지의 사전/사후 학생 답변 평균 수치를 상세 대조합니다.</p>
                    </div>

                    {responses.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-bold">데이터가 없습니다.</div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map(q => {
                          const preAvg = getQuestionAverage(q.id, 'pre');
                          const postAvg = getQuestionAverage(q.id, 'post');
                          const growth = (postAvg - preAvg).toFixed(2);

                          return (
                            <div key={q.id} className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50/50 transition duration-150">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="bg-slate-100 text-slate-700 text-xs font-black h-5 w-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {q.id}
                                  </span>
                                  <span className="text-sm font-bold text-slate-800 leading-normal">{q.text}</span>
                                </div>
                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border text-slate-500 border-slate-200">
                                    영역 {q.domain}
                                  </span>
                                  {postAvg > 0 && preAvg > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${parseFloat(growth) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                      성장: {parseFloat(growth) >= 0 ? `+${growth}` : growth}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-400 w-16">사전 평균</span>
                                  <div className="flex-grow bg-slate-100 rounded-full h-2 relative">
                                    <div 
                                      className="bg-slate-400 h-2 rounded-full" 
                                      style={{ width: `${(preAvg / 5) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 w-10 text-right">{preAvg > 0 ? `${preAvg.toFixed(2)}점` : '-'}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-emerald-600 w-16">사후 평균</span>
                                  <div className="flex-grow bg-emerald-50 rounded-full h-2 relative">
                                    <div 
                                      className="bg-emerald-600 h-2 rounded-full" 
                                      style={{ width: `${(postAvg / 5) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-black text-emerald-800 w-10 text-right">{postAvg > 0 ? `${postAvg.toFixed(2)}점` : '-'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {teacherSubTab === 'ttest' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" /> 통계적 교육 효과성 검정 (대응표본 t-test)
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-bold">
                            동일 학생의 사전 조사와 사후 조사를 일대일 매칭하여 유의미한 성장이 나타났는지 수학적으로 검증합니다. (p &lt; 0.05 기준)
                          </p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-xl text-xs font-black">
                          분석 가능한 일대일 매칭 대상: <span className="text-indigo-600">{pairedData.length}명</span>
                        </div>
                      </div>

                      {pairedData.length < 2 ? (
                        <div className="text-center py-12 text-slate-400 font-bold space-y-3">
                          <p>대응표본 t-검정을 수행하려면 동일한 학생명으로 입력된 '사전'과 '사후' 데이터가 쌍(pair)으로 존재해야 합니다.</p>
                          <p className="text-xs font-semibold text-slate-400">데이터가 없다면 우측 상단의 [테스트 가상 데이터 생성] 버튼을 눌러보세요.</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase bg-slate-50/50">
                                  <th className="py-3 px-4">영역구분</th>
                                  <th className="py-3 px-4">사전평균(M)</th>
                                  <th className="py-3 px-4">사후평균(M)</th>
                                  <th className="py-3 px-4">평균차이(Diff)</th>
                                  <th className="py-3 px-4">표준오차(SE)</th>
                                  <th className="py-3 px-4">t-값</th>
                                  <th className="py-3 px-4">자유도(df)</th>
                                  <th className="py-3 px-4">유의확률(p)</th>
                                  <th className="py-3 px-4">통계적 유의성(p&lt;.05)</th>
                                </tr>
                              </thead>
                              <tbody className="text-sm divide-y divide-slate-100">
                                <tr>
                                  <td className="py-4 px-4 font-bold text-slate-800">학업적 자기효능감</td>
                                  <td className="py-4 px-4 font-semibold text-slate-600">{preStats.d1.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-slate-800">{postStats.d1.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-emerald-600">+{tTestD1?.meanDiff}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD1?.se}</td>
                                  <td className="py-4 px-4 font-bold">{tTestD1?.t}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD1?.df}</td>
                                  <td className="py-4 px-4 font-black text-indigo-700">{tTestD1?.p === 0.001 ? '< .001' : tTestD1?.p}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${tTestD1?.significant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                      {tTestD1?.significant ? '유의미함 (H1 채택)' : '유의하지 않음'}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td className="py-4 px-4 font-bold text-slate-800">자기조절학습 능력</td>
                                  <td className="py-4 px-4 font-semibold text-slate-600">{preStats.d2.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-slate-800">{postStats.d2.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-emerald-600">+{tTestD2?.meanDiff}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD2?.se}</td>
                                  <td className="py-4 px-4 font-bold">{tTestD2?.t}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD2?.df}</td>
                                  <td className="py-4 px-4 font-black text-indigo-700">{tTestD2?.p === 0.001 ? '< .001' : tTestD2?.p}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${tTestD2?.significant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                      {tTestD2?.significant ? '유의미함 (H1 채택)' : '유의하지 않음'}
                                    </span>
                                  </td>
                                </tr>

                                <tr>
                                  <td className="py-4 px-4 font-bold text-slate-800">성장 마인드셋</td>
                                  <td className="py-4 px-4 font-semibold text-slate-600">{preStats.d3.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-slate-800">{postStats.d3.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-bold text-emerald-600">+{tTestD3?.meanDiff}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD3?.se}</td>
                                  <td className="py-4 px-4 font-bold">{tTestD3?.t}</td>
                                  <td className="py-4 px-4 text-slate-500">{tTestD3?.df}</td>
                                  <td className="py-4 px-4 font-black text-indigo-700">{tTestD3?.p === 0.001 ? '< .001' : tTestD3?.p}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${tTestD3?.significant ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                      {tTestD3?.significant ? '유의미함 (H1 채택)' : '유의하지 않음'}
                                    </span>
                                  </td>
                                </tr>

                                <tr className="bg-slate-50/50">
                                  <td className="py-4 px-4 font-black text-slate-900">종합 학습성향 평균</td>
                                  <td className="py-4 px-4 font-black text-slate-700">{preStats.total.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-black text-slate-900">{postStats.total.toFixed(2)}</td>
                                  <td className="py-4 px-4 font-black text-emerald-700">+{tTestTotal?.meanDiff}</td>
                                  <td className="py-4 px-4 text-slate-600 font-bold">{tTestTotal?.se}</td>
                                  <td className="py-4 px-4 font-black text-slate-900">{tTestTotal?.t}</td>
                                  <td className="py-4 px-4 text-slate-600 font-bold">{tTestTotal?.df}</td>
                                  <td className="py-4 px-4 font-black text-emerald-700">{tTestTotal?.p === 0.001 ? '< .001' : tTestTotal?.p}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${tTestTotal?.significant ? 'bg-emerald-600 text-white shadow-sm' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                      {tTestTotal?.significant ? '유의미함 (H1 채택)' : '유의하지 않음'}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <FileText className="h-4 w-4" /> 연구대회 결과 보고서용 자동 텍스트 기술
                              </h4>
                              <button
                                onClick={() => {
                                  const textToCopy = generateAcademicText();
                                  const dummy = document.createElement("textarea");
                                  document.body.appendChild(dummy);
                                  dummy.value = textToCopy;
                                  dummy.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(dummy);
                                  showToast("통계 보고서용 학술 초안이 클립보드에 복사되었습니다!");
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/15 transition"
                              >
                                📋 복사하기
                              </button>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-300 max-h-80 overflow-y-auto whitespace-pre-wrap font-medium">
                              {generateAcademicText()}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              ※ 위 텍스트는 교육전문 학술지 및 교육연구대회 심사 기준 규격(t-검정 표기 원칙)에 맞춰 실시간 연산 결과를 적용하여 생성된 정식 문구입니다. 연구 결과 보고서 '효과 검증' 장에 그대로 붙여넣어 활용하실 수 있습니다.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {teacherSubTab === 'data' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">설문 데이터 로우(Raw) 테이블</h3>
                        <p className="text-xs text-slate-400 mt-1 font-bold">수집된 각각의 학생별 설문 내역을 직접 확인하고 필터링하거나 불필요한 데이터를 삭제합니다.</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="이름 검색"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <select
                          value={filterPhase}
                          onChange={(e) => setFilterPhase(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none bg-white"
                        >
                          <option value="all">전체 차수</option>
                          <option value="pre">사전 (Pre)</option>
                          <option value="post">사후 (Post)</option>
                        </select>
                      </div>
                    </div>

                    {filteredResponses.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-bold">조건에 맞는 데이터가 없습니다.</div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase">
                              <th className="py-3.5 px-4">구분</th>
                              <th className="py-3.5 px-4">대상</th>
                              <th className="py-3.5 px-4">이름</th>
                              {Array.from({ length: 11 }, (_, i) => (
                                <th key={i} className="py-3.5 px-1.5 text-center">Q{i+1}</th>
                              ))}
                              <th className="py-3.5 px-3 text-center">효능감</th>
                              <th className="py-3.5 px-3 text-center">조절력</th>
                              <th className="py-3.5 px-3 text-center">마인드</th>
                              <th className="py-3.5 px-4 text-center">조치</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs divide-y divide-slate-100 font-semibold text-slate-700">
                            {filteredResponses.map((r) => {
                              const a = r.answers;
                              const d1Avg = ((a[1]+a[2]+a[3]+a[4])/4).toFixed(1);
                              const d2Avg = ((a[5]+a[6]+a[7]+a[8])/4).toFixed(1);
                              const d3Avg = ((a[9]+a[10]+a[11])/3).toFixed(1);

                              return (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition">
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${r.phase === 'pre' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
                                      {r.phase === 'pre' ? '사전' : '사후'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-900">{r.grade}학년 {r.classGroup}반 {r.number}번</td>
                                  <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                                  
                                  {Array.from({ length: 11 }, (_, i) => (
                                    <td key={i} className="py-3 px-1.5 text-center text-slate-600 font-medium">{a[i+1]}</td>
                                  ))}

                                  <td className="py-3 px-3 text-center text-emerald-600 font-extrabold">{d1Avg}</td>
                                  <td className="py-3 px-3 text-center text-indigo-600 font-extrabold">{d2Avg}</td>
                                  <td className="py-3 px-3 text-center text-amber-600 font-extrabold">{d3Avg}</td>
                                  
                                  <td className="py-3 px-4 text-center">
                                    <button 
                                      onClick={() => handleDeleteResponse(r.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                                      title="데이터 삭제"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-semibold">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>[I-Success Journey] 사회과 탐구 및 디지털 학습 성향 진단 & 통계 도구</p>
          <p>© 2026 초등학교 6학년 교육연구대회 논문 투고용 개발 모듈. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}