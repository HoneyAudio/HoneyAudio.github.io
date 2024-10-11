"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import cloud from "d3-cloud";
import {
  Facebook,
  Github,
  Loader2,
  Menu,
  Pause,
  Play,
  Twitter,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Option {
  text: string;
  value: string;
  size: number;
  gender?: number;
}

const fetchOptions = async (): Promise<{
  voiceOptions: Option[];
  languageOptions: Option[];
  nameOptions: Option[];
  categoryOptions: Option[];
}> => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    voiceOptions: [
      { text: "👩 Female", value: "female", size: 0 },
      { text: "👨 Male", value: "male", size: 0 },
    ],
    languageOptions: [
      { text: "🇩🇪 German", value: "de", size: 0 },
      { text: "🇺🇸 English", value: "en", size: 0 },
      { text: "🇪🇸 Spanish", value: "es", size: 0 },
      { text: "🇫🇷 French", value: "fr", size: 0 },
      { text: "🇮🇹 Italian", value: "it", size: 0 },
      { text: "🇵🇹 Portuguese", value: "pt", size: 0 },
    ],
    nameOptions: [
      { text: "Ava", value: "ava", size: 0, gender: 1 },
      { text: "Emma", value: "emma", size: 0, gender: 1 },
      { text: "Isabella", value: "isabella", size: 0, gender: 1 },
      { text: "James", value: "james", size: 0, gender: 0 },
      { text: "John", value: "john", size: 0, gender: 0 },
      { text: "Michael", value: "michael", size: 0, gender: 0 },
      { text: "Olivia", value: "olivia", size: 0, gender: 1 },
      { text: "Robert", value: "robert", size: 0, gender: 0 },
      { text: "Sophia", value: "sophia", size: 0, gender: 1 },
      { text: "William", value: "william", size: 0, gender: 0 },
    ],
    categoryOptions: [
      { text: "🏔️ Adventure", value: "adventure", size: 0 },
      { text: "🤣 Comedy", value: "comedy", size: 0 },
      { text: "🎭 Drama", value: "drama", size: 0 },
      { text: "🕵️ Mystery", value: "mystery", size: 0 },
      { text: "💖 Romance", value: "romance", size: 0 },
      { text: "🚀 Sci-Fi", value: "scifi", size: 0 },
    ],
  };
};

interface WordCloudProps {
  words: Option[];
  width: number;
  height: number;
  onSelect: (value: string) => void;
  selectedWord: string;
  isMobile: boolean;
}

const WordCloud: React.FC<WordCloudProps> = ({
  words,
  width,
  height,
  onSelect,
  selectedWord,
  isMobile,
}) => {
  const [cloudWords, setCloudWords] = useState<
    { text: string; size: number; x: number; y: number }[]
  >([]);
  const [showSelect, setShowSelect] = useState(false);

  useEffect(() => {
    cloud()
      .size([width, height])
      .words(
        words.map((w) => ({
          ...w,
          size: Math.max(
            10,
            Math.min(
              30,
              Math.sqrt((width * height) / words.length) * Math.random()
            )
          ),
        }))
      )
      .padding(2)
      .rotate(() => 0)
      .spiral("archimedean")
      .font("Jura")
      .fontSize((d) => d.size!)
      .on("end", (computedWords) => {
        setCloudWords(
          computedWords as {
            text: string;
            size: number;
            x: number;
            y: number;
          }[]
        );
      })
      .start();
  }, [words, width, height]);

  const handleWordClick = (word: string) => {
    const selectedOption = words.find((w) => w.text === word);
    if (selectedOption) {
      if (isMobile) {
        setShowSelect(true);
      } else {
        onSelect(selectedOption.value);
      }
    }
  };

  const handleSelectChange = (value: string) => {
    onSelect(value);
    setShowSelect(false);
  };

  if (isMobile && showSelect) {
    return (
      <Select onValueChange={handleSelectChange} value={selectedWord}>
        <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-700 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 text-white border-gray-700">
          {words
            .sort((a, b) => a.text.localeCompare(b.text))
            .map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
              >
                {option.text}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {cloudWords.map((word, i) => (
          <text
            key={i}
            style={{
              fontSize: `${word.size}px`,
              fontFamily: "Jura",
              cursor: "pointer",
              fill:
                word.text === words.find((w) => w.value === selectedWord)?.text
                  ? "#ffffff"
                  : "rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
            }}
            textAnchor="middle"
            transform={`translate(${word.x},${word.y})`}
            onClick={() => handleWordClick(word.text)}
          >
            {word.text}
          </text>
        ))}
      </g>
    </svg>
  );
};

const CircularProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      width="100"
      height="100"
    >
      <circle
        className="text-blue-500/10"
        strokeWidth="4"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
      />
      <circle
        className="text-blue-500 transition-all duration-500 ease-in-out"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
      />
    </svg>
  );
};

export default function Component() {
  const [voiceOptions, setVoiceOptions] = useState<Option[]>([]);
  const [languageOptions, setLanguageOptions] = useState<Option[]>([]);
  const [nameOptions, setNameOptions] = useState<Option[]>([]);
  const [categoryOptions, setcategoryOptions] = useState<Option[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showAddNameAlert, setShowAddNameAlert] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedGender, setSelectedGender] = useState(0); // 0 for male, 1 for female
  const audioRef = useRef<HTMLAudioElement | null>(new Audio());
  const nextAudioRef = useRef<HTMLAudioElement | null>(new Audio());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const options = await fetchOptions();
      setVoiceOptions(options.voiceOptions);
      setLanguageOptions(options.languageOptions);
      setNameOptions(options.nameOptions);
      setcategoryOptions(options.categoryOptions);

      // Set default selections
      const browserLang = navigator.language.split("-")[0];
      const defaultLang =
        options.languageOptions.find((lang) => lang.value === browserLang) ||
        options.languageOptions.find((lang) => lang.value === "en");
      if (defaultLang) setSelectedLanguage(defaultLang.value);

      setSelectedVoice(
        options.voiceOptions[
          Math.floor(Math.random() * options.voiceOptions.length)
        ].value
      );
      setSelectedTopic(
        options.categoryOptions[
          Math.floor(Math.random() * options.categoryOptions.length)
        ].value
      );
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        !(event.target as HTMLElement).closest(".menu-container")
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  const simulateAPICall = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newAudioFiles = [
      "https://download.samplelib.com/mp3/sample-3s.mp3",
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      "https://download.samplelib.com/mp3/sample-6s.mp3",
      "https://download.samplelib.com/mp3/sample-9s.mp3",
    ];
    setAudioFiles(newAudioFiles);
    setCurrentAudioIndex(0);
    setIsLoading(false);
    return newAudioFiles;
  };

  const handleSelection = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      async (value: string) => {
        if (setter === setSelectedName && value === selectedName) {
          setter("");
        } else {
          setter(value);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        setIsPlaying(false);
        setProgress(0);
        const newAudioFiles = await simulateAPICall();
        loadAudio(newAudioFiles[0], newAudioFiles[1]);
      },
    [selectedName]
  );

  const loadAudio = (currentAudioUrl: string, nextAudioUrl?: string) => {
    if (audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
    }
    if (nextAudioUrl && nextAudioRef.current) {
      nextAudioRef.current.src = nextAudioUrl;
      nextAudioRef.current.load();
    }
  };

  useEffect(() => {
    (async () => {
      const newAudioFiles = await simulateAPICall();
      loadAudio(newAudioFiles[0], newAudioFiles[1]);
    })();
  }, []);

  const playNextAudio = useCallback(() => {
    if (currentAudioIndex < audioFiles.length - 1) {
      setCurrentAudioIndex((prevIndex) => prevIndex + 1);
      const currentAudio = audioFiles[currentAudioIndex + 1];
      const nextAudio = audioFiles[currentAudioIndex + 2];
      loadAudio(currentAudio, nextAudio);
      audioRef.current?.play();
    } else {
      setCurrentAudioIndex(0);
      setIsPlaying(false);
      setProgress(0);
      (async () => {
        const newAudioFiles = await simulateAPICall();
        loadAudio(newAudioFiles[0], newAudioFiles[1]);
      })();
    }
  }, [audioFiles, currentAudioIndex]);

  const togglePlayPause = useCallback(() => {
    if (selectedLanguage && selectedVoice && selectedTopic) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  }, [isPlaying, selectedLanguage, selectedVoice, selectedTopic]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        const currentProgress =
          audio.currentTime / audio.duration + currentAudioIndex;
        setProgress(currentProgress / audioFiles.length);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", playNextAudio);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", playNextAudio);
    };
  }, [audioFiles, currentAudioIndex, playNextAudio]);

  const filteredNameOptions = useMemo(() => {
    return nameOptions.filter((name) => name.gender === selectedGender);
  }, [nameOptions, selectedGender]);

  const renderSelector = (
    options: Option[],
    selected: string,
    onSelect: (value: string) => void
  ) => {
    const containerWidth = containerRef.current?.offsetWidth || 240;
    const containerHeight = containerRef.current?.offsetHeight || 280;
    return (
      <WordCloud
        words={options}
        width={Math.max(240, containerWidth)}
        height={Math.max(280, containerHeight)}
        onSelect={onSelect}
        selectedWord={selected}
        isMobile={isMobile}
      />
    );
  };

  const handleAddName = () => {
    if (newName) {
      window.open(
        `https://x.com/intent/post?text=Hi+%40honeydotaudio%21%0A%0AHoney.audio%2C+add+my+name+«${newName}»+🙏%0A%0A%23honeydotaudio+%23honeyaddmyname`,
        "_blank"
      );
      setShowAddNameAlert(false);
      setNewName("");
    }
  };

  const handleGenderChange = (gender: number) => {
    setSelectedGender(gender);
    setSelectedName("");
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-purple-800 via-blue-900 to-teal-800 font-jura overflow-hidden"
      style={{ minWidth: "360px" }}
    >
      <div className="flex justify-between items-start p-4">
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white font-bold text-xl hover:bg-opacity-100 transition-opacity duration-300">
          honey 🍯 audio
        </div>
        <div className="relative menu-container">
          <Button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white hover:bg-opacity-100 transition-opacity duration-300"
          >
            <Menu />
          </Button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 bg-opacity-90 rounded-lg shadow-xl z-10">
              <a
                href="#"
                className="block px-4 py-2 text-white hover:bg-slate-800/50 rounded-lg"
              >
                Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-white hover:bg-slate-800/50 rounded-lg"
              >
                Settings
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-white hover:bg-slate-800/50 rounded-lg"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-grow m-6 relative">
        <div className="w-1/2 h-1/2 absolute top-0 left-0">
          <div
            className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-br-none"
            ref={containerRef}
          >
            {renderSelector(
              voiceOptions,
              selectedVoice,
              handleSelection(setSelectedVoice)
            )}
          </div>
        </div>
        <div className="w-1/2 h-1/2 absolute top-0 right-0">
          <div
            className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-bl-none"
            ref={containerRef}
          >
            {renderSelector(
              languageOptions,
              selectedLanguage,
              handleSelection(setSelectedLanguage)
            )}
          </div>
        </div>
        <div className="w-1/2 h-1/2 absolute bottom-0 left-0">
          <div
            className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-tr-none relative"
            ref={containerRef}
          >
            {renderSelector(
              filteredNameOptions,
              selectedName,
              handleSelection(setSelectedName)
            )}
            <Button
              onClick={() => setShowAddNameAlert(true)}
              className="absolute bottom-0 right-0 bg-slate-800/50 hover:bg-slate-900/70 text-white/50 hover:text-white text-xs py-1 px-2 rounded-br-3xl"
            >
              Add my name
            </Button>
            <div className="absolute top-0 left-0 flex space-x-2">
              <Button
                onClick={() => handleGenderChange(0)}
                className={`text-2xl px-2 py-1 rounded-tl-3xl ${
                  selectedGender === 0 ? "opacity-100 scale-110" : "opacity-50"
                }`}
              >
                👨
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 flex space-x-2">
              <Button
                onClick={() => handleGenderChange(1)}
                className={`text-2xl px-2 py-1 rounded-bl-3xl  ${
                  selectedGender === 1 ? "opacity-100 scale-110" : "opacity-50"
                }`}
              >
                👩
              </Button>
            </div>
          </div>
        </div>
        <div className="w-1/2 h-1/2 absolute bottom-0 right-0">
          <div
            className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-tl-none"
            ref={containerRef}
          >
            {renderSelector(
              categoryOptions,
              selectedTopic,
              handleSelection(setSelectedTopic)
            )}
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <CircularProgressBar progress={progress} />
          <Button
            onClick={togglePlayPause}
            className="rounded-full w-20 h-20 flex items-center justify-center shadow-lg transition-all duration-300 bg-slate-800/50 hover:bg-slate-900/70 relative"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            disabled={
              isLoading || !selectedLanguage || !selectedVoice || !selectedTopic
            }
          >
            {isLoading ? (
              <Loader2 size={40} className="text-white animate-spin" />
            ) : isPlaying ? (
              <Pause size={40} className="text-white" />
            ) : (
              <Play size={40} className="text-white" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-end p-4">
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white text-sm hover:bg-opacity-100 transition-opacity duration-300">
          © 2024 🍯 + 🎧 = 🫠
        </div>
        <div className="flex space-x-2">
          <Button className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white hover:bg-opacity-100 transition-opacity duration-300">
            <Github size={20} />
          </Button>
          <Button className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white hover:bg-opacity-100 transition-opacity duration-300">
            <Twitter size={20} />
          </Button>
          <Button className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white hover:bg-opacity-100 transition-opacity duration-300">
            <Facebook size={20} />
          </Button>
        </div>
      </div>

      {showAddNameAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Alert className="w-96 bg-slate-800 text-white border-slate-700 add-name-alert">
            <AlertTitle className="text-lg font-semibold mb-2">
              Add a new name
            </AlertTitle>
            <AlertDescription>
              <Input
                type="text"
                placeholder="Enter name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mb-4 bg-slate-700 text-white border-slate-600"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowAddNameAlert(false)}
                  variant="outline"
                  className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddName}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tweet #honeyAddMyName
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
