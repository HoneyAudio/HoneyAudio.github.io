/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Github, Loader2, Menu, Pause, Play, Twitter } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Option {
  text: string;
  value: string;
  size: number;
  gender?: "male" | "female";
  languageCode?: string;
}

interface DataJson {
  languages: { name: string; code: string }[];
  voices: {
    name: string;
    elevenlabs_voice_id: string;
    gender: string;
    language_id: number;
  }[];
  names: { name: string; gender: string; language_id: number }[];
  categories: { name: string; language_id: number }[];
  tts: {
    voice_id: number;
    category_id: number;
    name_id: number | null;
    language_id: number;
    audio_file: string;
    symbols: number;
  }[];
}

const fetchOptions = async (): Promise<{
  voiceOptions: Option[];
  languageOptions: Option[];
  nameOptions: Option[];
  categoryOptions: Option[];
  data: DataJson;
}> => {
  const response = await fetch("https://tourins.github.io/data.json?18");
  const data: DataJson = await response.json();

  const languages = data.languages.map((lang, index) => ({
    id: index,
    ...lang,
  }));

  const languageOptions: Option[] = languages.map((lang) => ({
    text: lang.name,
    value: lang.code,
    size: 0,
  }));

  const voiceOptions: Option[] = data.voices.map((voice, index) => ({
    text: voice.name,
    value: String(index),
    size: 0,
    gender: voice.gender as "male" | "female",
    languageCode: languages[voice.language_id].code,
  }));

  const nameOptions: Option[] = data.names.map((name, index) => ({
    text: name.name,
    value: String(index),
    size: 0,
    gender: name.gender as "male" | "female",
    languageCode: languages[name.language_id].code,
  }));

  const categoryOptions: Option[] = data.categories.map((category, index) => ({
    text: category.name,
    value: String(index),
    size: 0,
    languageCode: languages[category.language_id].code,
  }));

  return { voiceOptions, languageOptions, nameOptions, categoryOptions, data };
};

const WordCloud: React.FC<{
  words: Option[];
  width: number;
  height: number;
  onSelect: (value: string) => void;
  selectedWord: string;
  isMobile: boolean;
}> = ({ words, width, height, onSelect, selectedWord, isMobile }) => {
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
      .font("Jura")
      .fontSize((d) => d.size!)
      .on("end", (computedWords) =>
        setCloudWords(
          computedWords as {
            text: string;
            size: number;
            x: number;
            y: number;
          }[]
        )
      )
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

  if (isMobile && showSelect) {
    return (
      <Select
        onValueChange={(value) => {
          onSelect(value);
          setShowSelect(false);
        }}
        value={selectedWord}
      >
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

export default function EnhancedAudioPlayer() {
  const [options, setOptions] = useState<{ [key: string]: Option[] }>({});
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showAddNameAlert, setShowAddNameAlert] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedNameGender, setSelectedNameGender] = useState<
    "male" | "female"
  >("male");
  const [dataJson, setDataJson] = useState<DataJson | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Added loading state
  const audioRef = useRef<HTMLAudioElement | null>(new Audio());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true); // Set loading state to true
      const fetchedOptions = await fetchOptions();
      setOptions({
        voices: fetchedOptions.voiceOptions,
        languages: fetchedOptions.languageOptions,
        names: fetchedOptions.nameOptions,
        categories: fetchedOptions.categoryOptions,
      });
      setDataJson(fetchedOptions.data);

      // Set default language
      const browserLang = navigator.language.split("-")[0];
      const defaultLang =
        fetchedOptions.languageOptions.find(
          (lang) => lang.value === browserLang
        ) ||
        fetchedOptions.languageOptions.find((lang) => lang.value === "en") ||
        fetchedOptions.languageOptions[0];
      setSelectedOptions((prev) => ({ ...prev, language: defaultLang.value }));

      // Load user selections from localStorage
      const savedSelections = ["language", "voice", "name", "category"].reduce(
        (acc, key) => {
          const saved = localStorage.getItem(
            `selected${key.charAt(0).toUpperCase() + key.slice(1)}`
          );
          if (saved) acc[key] = saved;
          return acc;
        },
        {} as { [key: string]: string }
      );
      setSelectedOptions((prev) => ({ ...prev, ...savedSelections }));

      const savedGender = localStorage.getItem("selectedNameGender") as
        | "male"
        | "female"
        | null;
      if (savedGender) setSelectedNameGender(savedGender);

      setIsInitialLoading(false); // Set loading state to false after data is fetched
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const updatePlaylist = useCallback(async () => {
    if (!dataJson) return [];

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const selectedLanguageId = dataJson.languages.findIndex(
      (lang) => lang.code === selectedOptions.language
    );
    const selectedVoiceId = parseInt(selectedOptions.voice);
    const selectedNameId = selectedOptions.name
      ? parseInt(selectedOptions.name)
      : null;
    const selectedCategoryId = parseInt(selectedOptions.category);

    let personalizedTTS: any[] = [];
    let nonPersonalizedTTS: any[] = [];

    if (selectedNameId !== null) {
      personalizedTTS = dataJson.tts.filter(
        (tts) =>
          tts.voice_id === selectedVoiceId &&
          tts.category_id === selectedCategoryId &&
          tts.language_id === selectedLanguageId &&
          tts.name_id === selectedNameId
      );
    }

    nonPersonalizedTTS = dataJson.tts.filter(
      (tts) =>
        tts.voice_id === selectedVoiceId &&
        tts.category_id === selectedCategoryId &&
        tts.language_id === selectedLanguageId &&
        tts.name_id === null
    );

    const shuffledNonPersonalizedTTS = nonPersonalizedTTS.sort(
      () => 0.5 - Math.random()
    );
    const limitedTTS = [
      ...personalizedTTS,
      ...shuffledNonPersonalizedTTS,
    ].slice(0, 20);
    const newAudioFiles = limitedTTS.map((tts) =>
      selectedOptions.language !== "en"
        ? `https://tourins.github.io/audios/${tts.audio_file}`
        : `https://tourins.github.io/${tts.audio_file}`
    );

    setAudioFiles(newAudioFiles);
    setCurrentAudioIndex(0);
    setIsLoading(false);
    return newAudioFiles;
  }, [dataJson, selectedOptions]);

  const handleSelection = useCallback(
    async (key: string, value: string) => {
      if (selectedOptions[key] === value) return; // Don't update if the same option is selected

      setSelectedOptions((prev) => {
        const newOptions = { ...prev, [key]: value };
        if (key === "language") {
          // Reset voice, name, and category when language changes
          delete newOptions.voice;
          delete newOptions.name;
          delete newOptions.category;
        }
        // Save to localStorage
        localStorage.setItem(
          `selected${key.charAt(0).toUpperCase() + key.slice(1)}`,
          value
        );
        return newOptions;
      });

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsPlaying(false);
      setProgress(0);
      const newAudioFiles = await updatePlaylist();
      if (newAudioFiles.length > 0) {
        loadAudio(newAudioFiles[0]);
      }
    },
    [selectedOptions, updatePlaylist]
  );

  const loadAudio = (currentAudioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
    }
  };

  const playNextAudio = useCallback(() => {
    if (currentAudioIndex < audioFiles.length - 1) {
      setCurrentAudioIndex((prevIndex) => prevIndex + 1);
      const currentAudio = audioFiles[currentAudioIndex + 1];
      loadAudio(currentAudio);
      audioRef.current?.play();
    } else {
      setCurrentAudioIndex(0);
      setIsPlaying(false);
      setProgress(0);
      updatePlaylist().then((newAudioFiles) => {
        if (newAudioFiles.length > 0) {
          loadAudio(newAudioFiles[0]);
        }
      });
    }
  }, [audioFiles, currentAudioIndex, updatePlaylist]);

  const togglePlayPause = useCallback(() => {
    if (
      selectedOptions.language &&
      selectedOptions.voice &&
      selectedOptions.category &&
      audioFiles.length > 0
    ) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          loadAudio(audioFiles[currentAudioIndex]);
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
          setIsPlaying(true);
        }
      }
    }
  }, [isPlaying, selectedOptions, audioFiles, currentAudioIndex]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        const currentProgress =
          (audio.currentTime / audio.duration + currentAudioIndex) /
          audioFiles.length;
        setProgress(currentProgress);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", playNextAudio);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", playNextAudio);
    };
  }, [audioFiles, currentAudioIndex, playNextAudio]);

  const filteredOptions = useMemo(
    () => ({
      voices:
        options.voices?.filter(
          (v) => v.languageCode === selectedOptions.language
        ) || [],
      categories:
        options.categories?.filter(
          (c) => c.languageCode === selectedOptions.language
        ) || [],
    }),
    [options.voices, options.categories, selectedOptions.language]
  );

  const filteredNames = useMemo(
    () =>
      options.names?.filter(
        (n) =>
          n.languageCode === selectedOptions.language &&
          n.gender === selectedNameGender
      ) || [],
    [options.names, selectedOptions.language, selectedNameGender]
  );

  const renderSelector = (
    key: string,
    options: Option[],
    selected: string,
    isRequired: boolean
  ) => {
    const containerWidth = containerRef.current?.offsetWidth || 240;
    const containerHeight = containerRef.current?.offsetHeight || 280;
    return (
      <div
        className={`relative ${
          isRequired && !selected && options.length > 0
            ? "bg-red-500/20 rounded-3xl"
            : ""
        }`}
      >
        {options.length > 0 ? (
          <WordCloud
            words={options}
            width={Math.max(240, containerWidth)}
            height={Math.max(280, containerHeight)}
            onSelect={(value) => handleSelection(key, value)}
            selectedWord={selected}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-center p-4">
            No options available with current settings.
          </div>
        )}
      </div>
    );
  };

  const handleAddName = () => {
    if (newName) {
      window.open(
        `https://x.com/intent/post?text=Hi+%40honeydotaudio%21%0A%0AHoney%2C+add+my+name+«${newName}»+🙏%0A%0A%23honeydotaudio+%23honeyaddmyname`,
        "_blank"
      );
      setShowAddNameAlert(false);
      setNewName("");
    }
  };

  const handleNameGenderChange = (gender: "male" | "female") => {
    setSelectedNameGender(gender);
    localStorage.setItem("selectedNameGender", gender);
    setSelectedOptions((prev) => ({ ...prev, name: "" }));
  };

  useEffect(() => {
    updatePlaylist();
  }, [updatePlaylist]);

  return (
    <div
      className="h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-purple-800 via-blue-900 to-teal-800 font-jura overflow-hidden"
      style={{ minWidth: "360px" }}
    >
      {isInitialLoading ? ( // Added loading indicator
        <div className="flex items-center justify-center h-full">
          <Loader2 size={40} className="text-white animate-spin" />
        </div>
      ) : (
        <>
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
                  "voice",
                  filteredOptions.voices,
                  selectedOptions.voice,
                  true
                )}
              </div>
            </div>
            <div className="w-1/2 h-1/2 absolute top-0 right-0">
              <div
                className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-bl-none"
                ref={containerRef}
              >
                {renderSelector(
                  "language",
                  options.languages || [],
                  selectedOptions.language,
                  true
                )}
              </div>
            </div>
            <div className="w-1/2 h-1/2 absolute bottom-0 left-0">
              <div
                className="bg-slate-950/20 h-full flex items-center justify-center rounded-3xl rounded-tr-none relative"
                ref={containerRef}
              >
                {renderSelector(
                  "name",
                  filteredNames,
                  selectedOptions.name,
                  false
                )}
                <Button
                  onClick={() => setShowAddNameAlert(true)}
                  className="absolute bottom-0 right-0 bg-slate-800/50 hover:bg-slate-900/70 text-white/50 hover:text-white text-xs py-1 px-2 rounded-br-3xl"
                >
                  Add my name
                </Button>
                <div className="absolute top-0 left-0 flex space-x-2">
                  <Button
                    onClick={() => handleNameGenderChange("male")}
                    className={`text-2xl px-2 py-1 rounded-tl-3xl ${
                      selectedNameGender === "male"
                        ? "opacity-100 scale-110"
                        : "opacity-50"
                    }`}
                  >
                    👨
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 flex space-x-2">
                  <Button
                    onClick={() => handleNameGenderChange("female")}
                    className={`text-2xl px-2 py-1 rounded-bl-3xl ${
                      selectedNameGender === "female"
                        ? "opacity-100 scale-110"
                        : "opacity-50"
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
                  "category",
                  filteredOptions.categories,
                  selectedOptions.category,
                  true
                )}
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              {selectedOptions.language && selectedOptions.language !== "en" ? (
                <small className="text-white">demo audio</small>
              ) : (
                <></>
              )}
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <CircularProgressBar progress={progress} />
              <Button
                onClick={togglePlayPause}
                className={`rounded-full w-20 h-20 flex items-center justify-center shadow-lg transition-all duration-300 relative ${
                  audioFiles.length === 0
                    ? "bg-red-500/50 hover:bg-red-600/70"
                    : "bg-slate-800/50 hover:bg-slate-900/70"
                }`}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                disabled={
                  isLoading ||
                  !selectedOptions.language ||
                  !selectedOptions.voice ||
                  !selectedOptions.category ||
                  audioFiles.length === 0
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
                <a href="https://github.com/HoneyAudio" target="_blank">
                  <Github size={20} />
                </a>
              </Button>
              <Button className="bg-gray-900 bg-opacity-50 rounded-lg p-2 text-white hover:bg-opacity-100 transition-opacity duration-300">
                <a href="https://x.com/honeydotaudio" target="_blank">
                  <Twitter size={20} />
                </a>
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
        </>
      )}
    </div>
  );
}
