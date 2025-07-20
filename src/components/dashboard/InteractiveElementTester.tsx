import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, AlertTriangle, Eye, MousePointer, Keyboard, Touchpad as Touch, Monitor } from 'lucide-react';
import Button from '../ui/Button';

interface ElementTest {
  selector: string;
  name: string;
  type: 'button' | 'link' | 'input' | 'dropdown' | 'toggle';
  expectedAction: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  error?: string;
}

const InteractiveElementTester: React.FC = () => {
  const [elements, setElements] = useState<ElementTest[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  // Scan for interactive elements
  const scanInteractiveElements = () => {
    setIsScanning(true);
    
    const interactiveSelectors = [
      // Buttons
      { selector: 'button', type: 'button' as const },
      { selector: '[role="button"]', type: 'button' as const },
      { selector: 'input[type="button"]', type: 'button' as const },
      { selector: 'input[type="submit"]', type: 'button' as const },
      
      // Links
      { selector: 'a[href]', type: 'link' as const },
      { selector: '[role="link"]', type: 'link' as const },
      
      // Form inputs
      { selector: 'input[type="text"]', type: 'input' as const },
      { selector: 'input[type="email"]', type: 'input' as const },
      { selector: 'input[type="password"]', type: 'input' as const },
      { selector: 'textarea', type: 'input' as const },
      { selector: 'select', type: 'dropdown' as const },
      
      // Toggles and checkboxes
      { selector: 'input[type="checkbox"]', type: 'toggle' as const },
      { selector: 'input[type="radio"]', type: 'toggle' as const },
      { selector: '[role="switch"]', type: 'toggle' as const }
    ];

    const foundElements: ElementTest[] = [];

    interactiveSelectors.forEach(({ selector, type }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const testId = element.getAttribute('data-testid');
        const ariaLabel = element.getAttribute('aria-label');
        const text = element.textContent?.trim() || '';
        const id = element.id;
        
        const name = testId || ariaLabel || text || id || `${type}-${index}`;
        
        foundElements.push({
          selector: testId ? `[data-testid="${testId}"]` : `${selector}:nth-of-type(${index + 1})`,
          name: name.substring(0, 50), // Limit name length
          type,
          expectedAction: getExpectedAction(type, name),
          status: 'pending'
        });
      });
    });

    setElements(foundElements);
    setIsScanning(false);
  };

  const getExpectedAction = (type: string, name: string): string => {
    switch (type) {
      case 'button':
        return 'Should trigger click event and execute associated action';
      case 'link':
        return 'Should navigate to target URL or scroll to anchor';
      case 'input':
        return 'Should accept user input and validate data';
      case 'dropdown':
        return 'Should open options list and allow selection';
      case 'toggle':
        return 'Should toggle state between checked/unchecked';
      default:
        return 'Should respond to user interaction';
    }
  };

  const testElement = async (elementTest: ElementTest): Promise<boolean> => {
    setCurrentTest(elementTest.name);
    
    try {
      const element = document.querySelector(elementTest.selector) as HTMLElement;
      
      if (!element) {
        throw new Error('Element not found in DOM');
      }

      // Check if element is visible and interactable
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                          rect.bottom <= window.innerHeight && 
                          rect.right <= window.innerWidth;

      if (!isVisible) {
        throw new Error('Element is not visible');
      }

      // Test different interaction methods based on element type
      switch (elementTest.type) {
        case 'button':
        case 'link':
          // Simulate click
          element.focus();
          element.click();
          break;
          
        case 'input':
          // Test input functionality
          if (element instanceof HTMLInputElement) {
            element.focus();
            element.value = 'test';
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
          break;
          
        case 'dropdown':
          // Test dropdown functionality
          if (element instanceof HTMLSelectElement) {
            element.focus();
            if (element.options.length > 1) {
              element.selectedIndex = 1;
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          break;
          
        case 'toggle':
          // Test toggle functionality
          if (element instanceof HTMLInputElement) {
            element.focus();
            element.checked = !element.checked;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
          break;
      }

      // Wait a bit to see if any errors occur
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error(`Test failed for ${elementTest.name}:`, error);
      return false;
    }
  };

  const runAllTests = async () => {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      setElements(prev => prev.map((el, index) => 
        index === i ? { ...el, status: 'testing' } : el
      ));

      try {
        const passed = await testElement(element);
        
        setElements(prev => prev.map((el, index) => 
          index === i ? { 
            ...el, 
            status: passed ? 'passed' : 'failed',
            error: passed ? undefined : 'Test execution failed'
          } : el
        ));
      } catch (error) {
        setElements(prev => prev.map((el, index) => 
          index === i ? { 
            ...el, 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : el
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setCurrentTest(null);
  };

  useEffect(() => {
    // Auto-scan on component mount
    scanInteractiveElements();
  }, []);

  const getStatusIcon = (status: ElementTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <Target className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: ElementTest['type']) => {
    switch (type) {
      case 'button':
        return <MousePointer className="w-3 h-3" />;
      case 'link':
        return <Monitor className="w-3 h-3" />;
      case 'input':
        return <Keyboard className="w-3 h-3" />;
      case 'dropdown':
        return <Monitor className="w-3 h-3" />;
      case 'toggle':
        return <Touch className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const passedCount = elements.filter(el => el.status === 'passed').length;
  const failedCount = elements.filter(el => el.status === 'failed').length;
  const totalCount = elements.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Interactive Element Tester</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={scanInteractiveElements}
            loading={isScanning}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Rescan Elements'}
          </Button>
          <Button
            onClick={runAllTests}
            disabled={elements.length === 0 || currentTest !== null}
          >
            <Target className="w-4 h-4 mr-2" />
            Test All Elements
          </Button>
        </div>
      </div>

      {/* Test Summary */}
      {totalCount > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-blue-700">Total Elements</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{passedCount}</div>
            <div className="text-sm text-green-700">Passed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-600">
              {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-700">Success Rate</div>
          </div>
        </div>
      )}

      {/* Current Test */}
      {currentTest && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-blue-600 animate-pulse mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Currently Testing</h3>
              <p className="text-blue-700">{currentTest}</p>
            </div>
          </div>
        </div>
      )}

      {/* Elements List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {elements.map((element, index) => (
          <motion.div
            key={`${element.selector}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 border rounded-lg ${
              element.status === 'passed' ? 'bg-green-50 border-green-200' :
              element.status === 'failed' ? 'bg-red-50 border-red-200' :
              element.status === 'testing' ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(element.status)}
                <div className="ml-3">
                  <div className="flex items-center">
                    {getTypeIcon(element.type)}
                    <span className="ml-2 font-medium text-gray-900">{element.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                      {element.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{element.expectedAction}</p>
                </div>
              </div>
            </div>
            
            {element.error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                Error: {element.error}
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500 font-mono">
              Selector: {element.selector}
            </div>
          </motion.div>
        ))}
      </div>

      {elements.length === 0 && !isScanning && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Elements Found</h3>
          <p className="text-gray-600">Click "Rescan Elements" to detect interactive components</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveElementTester;