import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import "../../pages/i18n"

type ItemsType = {
  id: UniqueIdentifier;
  task: any;
  containerId?: any
  handleRemove?:any
};

const Items = ({ id, task, containerId, handleRemove}: ItemsType) => {
  const { t, i18n } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'item',
    },
  });

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'px-2 py-4 bg-white rounded-xl w-full border border-transparent hover:border-gray-200 cursor-pointer', 
        isDragging && 'opacity-50', 
        'shadow-xl'
      )}
    >
      <div className="flex items-center justify-between font-bold">
        {task.title}
        <button
          className="border p-2 text-xs rounded-xl shadow-lg hover:shadow-xl"
          {...listeners}
        >
          {t("draghandle")}
        </button>
      </div>

      <div>
      <p>{task.description}</p>  
      </div>  

      <div className="flex items-center justify-between italic">
        <p >{task.difficulty}</p>
        <p>{task.date}</p>
        
      </div>

        <div className="flex items-center justify-center font-bold ">
          <button onClick={() => handleRemove(id, containerId)} className="border p-2 text-xs rounded-xl shadow-lg hover:shadow-xl ">
            {t("remove")} 
          </button>
        </div>

    </div>
  );
};

export default Items;
