import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useAuth } from '../context/AuthContext';
import QuizService, { QuizAttempt } from '../services/QuizService';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string; // 'A', 'B', 'C', or 'D'
}

interface QuizGalleryProps {
  questions: QuizQuestion[];
  onClose: () => void;
  topicId: string;
}

const QuizGallery: React.FC<QuizGalleryProps> = ({ questions, onClose, topicId }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(prev => {
      const copy = [...prev];
      copy[current] = option;
      return copy;
    });
  };

  const handleSubmit = async () => {
    // Calculate score directly, not depending on submitted state
    const score = selected.reduce((acc, sel, idx) => sel === questions[idx].answer ? acc + 1 : acc, 0);
    setSubmitted(true);
    // Save attempt to Supabase
    if (user && user.id && questions.length > 0) {
      try {
        await QuizService.saveAttempt({
          userId: user.id,
          topicId,
          score,
          total: questions.length
        });
        // Refresh history after saving new attempt
        const updatedHistory = await QuizService.getAttempts({ userId: user.id, topicId });
        setHistory(updatedHistory);
      } catch (e) {
        console.error('Error saving quiz attempt:', e);
      }
    }
  };

  const handleRestart = () => {
    setSelected(Array(questions.length).fill(null));
    setSubmitted(false);
    setCurrent(0);
  };

  const correctCount = selected.reduce((acc, sel, idx) => {
    if (!submitted) return acc;
    return sel === questions[idx].answer ? acc + 1 : acc;
  }, 0);

  useEffect(() => {
    if (user && user.id && topicId) {
      setHistoryLoading(true);
      QuizService.getAttempts({ userId: user.id, topicId })
        .then(setHistory)
        .catch((error) => {
          console.error('Error fetching quiz history:', error);
          setHistory([]);
        })
        .finally(() => setHistoryLoading(false));
    }
  }, [user, topicId]);

  // Calculate accuracy %
  const totalCorrect = history.reduce((acc, h) => acc + h.score, 0);
  const totalQuestions = history.reduce((acc, h) => acc + h.total, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mt-8 flex flex-col items-center">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/80 hover:bg-siksha-purple hover:text-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center transition-all duration-150"
            onClick={onClose}
            aria-label="Close Quiz"
          >
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-bold mb-2">Quiz</h2>
          <div className="w-full max-w-lg">
            <div className="mb-4">
              <span className="text-base font-semibold">Question {current + 1} of {questions.length}</span>
              <div className="mt-2 text-md font-medium">{questions[current].question}</div>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {questions[current].options.map((opt, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selected[current] === letter;
                const isCorrect = questions[current].answer === letter;
                const isWrong = submitted && isSelected && !isCorrect;
                return (
                  <Button
                    key={letter}
                    variant={isSelected ? (isCorrect && submitted ? 'default' : 'secondary') : 'outline'}
                    className={`justify-start w-full text-left whitespace-normal break-words min-h-[4.5rem] py-4 px-5 rounded-lg border transition-all duration-150 flex items-start gap-3 relative h-auto
                      ${isCorrect && submitted ? 'bg-green-200 border-green-600' : ''}
                      ${isWrong ? 'bg-red-200 border-red-600' : ''}
                      ${isSelected ? 'ring-2 ring-siksha-purple' : ''}
                    `}
                    onClick={() => handleSelect(letter)}
                    disabled={submitted}
                  >
                    <span className="font-bold shrink-0 mt-1">{letter}.</span>
                    <span className="flex-1 break-words whitespace-pre-wrap overflow-hidden py-1">{opt}</span>
                  </Button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
              >
                Previous
              </Button>
              {current === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitted || selected.some(sel => sel === null)}
                  className="bg-siksha-purple text-white"
                >
                  {submitted ? 'Submitted' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  variant="outline"
                >
                  Next
                </Button>
              )}
            </div>
            {submitted && (
              <div className="mt-6 text-center">
                <div className="text-lg font-bold text-siksha-green">Score: {correctCount} / {questions.length}</div>
                <div className="flex justify-center gap-2 mt-3">
                  <Button className="" onClick={() => setShowHistory(true)} variant="secondary">History</Button>
                </div>
                <Dialog open={showHistory} onOpenChange={setShowHistory}>
                  <DialogContent className="max-w-md w-full">
                    <DialogTitle>Quiz History</DialogTitle>
                    <DialogDescription>
                      View your previous quiz attempts and scores for this topic.
                    </DialogDescription>
                    <div className="mb-2 text-sm text-muted-foreground">Average Accuracy: <span className="font-semibold text-black">{accuracy}%</span></div>
                    {historyLoading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No attempts yet.</div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {history.map((h, i) => (
                          <li key={h.id} className="py-2 flex justify-between items-center">
                            <span className="text-sm">{new Date(h.attempted_at).toLocaleDateString()}</span>
                            <span className="font-semibold">{h.score} / {h.total}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGallery; 