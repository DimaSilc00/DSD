import React, {useState} from 'react';
import ContainerProps from './container.type';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Button } from '../Button';
import { SortableContext } from '@dnd-kit/sortable';
import Items from '../Item';
import Input from '../Input';
import Select from 'react-select'
import { useTranslation } from 'react-i18next';
import "../../pages/i18n" 


interface difficulty { 
  value:string;
  label:string;
}

const Container = ({
  id,
  tasks,
  title,
  handleRemove,
  onAddItem,
}: ContainerProps) => {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'container',
    },
  });

  const [query, setQuery] = useState('');

  const [difficulty, setDifficulty] = useState<difficulty>({value: '', label: ''});
  const { t, i18n } = useTranslation();
  const options = [  {value:'all', label: (t('all'))},
                     {value:'super easy', label: (t('super easy'))},
                     {value:'easy', label: (t('easy'))},
                     {value:'normal', label: (t('normal'))},
                     {value:'hard', label: (t('hard'))},
                     {value:'super hard', label: (t('super hard'))}]

                                       

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'w-full h-full p-4 bg-gray-50 rounded-xl flex flex-col gap-y-4 shadow-xl',
        isDragging && 'opacity-50',
        
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-gray-800 text-xl">{title}</h1>
          <Input
          
            type="text"
            placeholder={t("search")}
            name="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select placeholder= {t("select")}
            onChange={(selectedOpt:any) => setDifficulty(selectedOpt)}
            options={options}
          />
        </div>
      </div>

      <SortableContext items={tasks.map((i:any) => i.id)}>
                    <div className="flex items-start flex-col gap-y-4">
                      {tasks
                            .filter((task:any) => difficulty.value === 'all' || difficulty.value === '' ?  task.title.toLowerCase().includes(query) : task.title.toLowerCase().includes(query) && task.difficulty === difficulty.value) 
                            .map((i:any) => (
                        <Items task={i} id={i.id} key={i.id} containerId={id} handleRemove={handleRemove}/>
                      ))}
                    </div>
                  </SortableContext>


      <Button variant="ghost" onClick={onAddItem}>
        {t("additem")}
      </Button>
    </div>
  );
};

export default Container;
