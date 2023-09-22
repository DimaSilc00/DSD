import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import "./i18n" 

// DnD
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { Inter } from 'next/font/google';

// Components
import Container from '@/components/Container';
import Items from '@/components/Item';
import Modal from '@/components/Modal';
import Input from '@/components/Input';

import Select from 'react-select'
import { json } from 'stream/consumers';

const inter = Inter({ subsets: ['latin'] });

type DNDType = {
  id: UniqueIdentifier;
  title: string;
  transitionKey: string;
  items: {
    id: UniqueIdentifier;
    title: string;
    date: string;
    difficulty: any;
    description: string;
  }[];
};



export default function Home() {
  const { t, i18n } = useTranslation();

  
  
  
  const [containers, setContainers] = useState<DNDType[]>([
  {id: `container-1`, 
  title: t('todo' ) , 
  items:[],
  transitionKey: 'todo'},
  {id: `container-2`, 
  title: t('doing') , 
  items:[],
  transitionKey: 'doing'},
  {id: `container-3`, 
  title: t('done') , 
  items:[],
  transitionKey: 'done'}
]);
const  onClickLanguageChange = (e:any) => {
  const language = e.target.value;
  i18n.changeLanguage(language);
  setContainers((prevState) => prevState.map((item) => ({...item, title : t(item.transitionKey)})))
};

console.log('asds' , containers)

  useEffect(() => {
   const localContainers = JSON.parse(localStorage.getItem('containers') || '[]')
   if(localContainers.length === 0) return
    setContainers(JSON.parse(localStorage.getItem('containers') || '[]')  )
  },[])

  console.log(containers)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [currentContainerId, setCurrentContainerId] =
    useState<UniqueIdentifier>();
  const [task, setTask] = useState({
    taskName:'',
    taskDescription: '',
    difficulty:''
  });


  const [difficulty, setDifficulty] = useState({});

  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const options = [  
  {value:'super easy', label: (t('super easy'))},
  {value:'easy', label: (t('easy'))},
  {value:'normal', label: (t('normal'))},
  {value:'hard', label: (t('hard'))},
  {value:'super hard', label: (t('super hard'))}]



  const handleRemove = (taskId:string , containerId:string) => {
    const copy = [...containers]
    const container = copy.find((container:any) => container.id === containerId)
    
    console.log(container.items)

    const index = container.items.findIndex((task:any) => task.id === taskId)
    container.items.splice(index,1)
    setContainers(copy)
    localStorage.setItem ('containers', JSON.stringify(containers))
  }

  const onAddItem = () => {
    if (!task) return;
    const id = `item-${uuidv4()}`;
    const container = containers.find((item) => item.id === currentContainerId);
    if (!container) return;
    container.items.push({
      id,
      title: task.taskName,
      date: new Date().toUTCString().slice(5, 16) ,
      description: task.taskDescription ,
      difficulty: difficulty.value
    });
    setContainers([...containers]);
    localStorage.setItem ('containers', JSON.stringify(containers))
    setTask({
      taskName:'',
      taskDescription: '',
      difficulty:''
    });
    setShowAddItemModal(false);
  };

  // Find the value of the items
  function findValueOfItems(id: UniqueIdentifier | undefined, type: string) {
    if (type === 'container') {
      return containers.find((item) => item.id === id);
    }
    if (type === 'item') {
      return containers.find((container) =>
        container.items.find((item) => item.id === id),
      );
    }
  }

  const findItem = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'item');
    if (!container) return '';
    const item = container.items.find((item) => item.id === id);
    if (!item) return '';
    return item;
  };

  const findContainerTitle = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'container');
    if (!container) return '';
    return container.title;
  };

  const findContainerItems = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'container');
    if (!container) return [];
    return container.items;
  };

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    // Handle Items Sorting
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('item') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );
      const overitemIndex = overContainer.items.findIndex(
        (item) => item.id === over.id,
      );
      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers];
        newItems[activeContainerIndex].items = arrayMove(
          newItems[activeContainerIndex].items,
          activeitemIndex,
          overitemIndex,
        );

        setContainers(newItems);
      } else {
        // In different containers
        let newItems = [...containers];
        const [removeditem] = newItems[activeContainerIndex].items.splice(
          activeitemIndex,
          1,
        );
        newItems[overContainerIndex].items.splice(
          overitemIndex,
          0,
          removeditem,
        );
        setContainers(newItems);
      }
      localStorage.setItem ('containers', JSON.stringify(containers))
    }

    // Handling Item Drop Into a Container
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('container') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );

      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );

      // Remove the active item from the active container and add it to the over container
      let newItems = [...containers];
      const [removeditem] = newItems[activeContainerIndex].items.splice(
        activeitemIndex,
        1,
      );
      newItems[overContainerIndex].items.push(removeditem);
      setContainers(newItems);
      localStorage.setItem ('containers', JSON.stringify(containers))
    }
  };

  // This is the function that handles the sorting of the containers and items when the user is done dragging.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Handling Container Sorting
    if (
      active.id.toString().includes('container') &&
      over?.id.toString().includes('container') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === active.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === over.id,
      );
      // Swap the active and over container
      let newItems = [...containers];
      newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex);
      setContainers(newItems);
      localStorage.setItem ('containers', JSON.stringify(containers))
    }

    // Handling item Sorting
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('item') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );
      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );
      const overitemIndex = overContainer.items.findIndex(
        (item) => item.id === over.id,
      );

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers];
        newItems[activeContainerIndex].items = arrayMove(
          newItems[activeContainerIndex].items,
          activeitemIndex,
          overitemIndex,
        );
        setContainers(newItems);
      } else {
        // In different containers
        let newItems = [...containers];
        const [removeditem] = newItems[activeContainerIndex].items.splice(
          activeitemIndex,
          1,
        );
        newItems[overContainerIndex].items.splice(
          overitemIndex,
          0,
          removeditem,
        );
        setContainers(newItems);
      }
      localStorage.setItem ('containers', JSON.stringify(containers))
    }

    // Handling item dropping into Container
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('container') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );
      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );

      let newItems = [...containers];
      const [removeditem] = newItems[activeContainerIndex].items.splice(
        activeitemIndex,
        1,
      );
      newItems[overContainerIndex].items.push(removeditem);
      setContainers(newItems);
      localStorage.setItem ('containers', JSON.stringify(containers))
    }
    setActiveId(null);
  }

  return (
    <div className="mx-auto max-w-7xl py-10">
      {/* Add Item Modal */}
      <Modal showModal={showAddItemModal} setShowModal={setShowAddItemModal}>
        <div className="flex flex-col w-full items-start gap-y-4">
          <h1 className="text-gray-800 text-3xl font-bold">{t("additem")}</h1>
          <Input
            type="text"
            placeholder={t("tasktitle")}
            name="task"
            value={task.taskName}
            onChange={(e) => setTask(prev => ({...prev, taskName: e.target.value}))}
          />

          <Input
            type="text"
            placeholder={t("taskdesc")}
            name="Description"
            value={task.taskDescription}
            onChange={(e) => setTask(prev => ({...prev, taskDescription: e.target.value}))}
          />

          <Select placeholder= {t("select")}
            onChange={(selectedOpt:any) => setDifficulty(selectedOpt)}
            options={options}
          />
          
          

          <button className=" hover:opacity-80 text-center w-full" onClick={onAddItem}>{t("additem")}</button>
        </div>
      </Modal>
      <header className="flex items-center justify-between gap-y-2 bg-black">
        <h1 className="text-800 text-5xl font-bold text-white">DSD</h1>
        <div className = "box">
          <select className="select-box black" style={{width:200}} onClick={onClickLanguageChange}>
            <option value="en"> English</option>
            <option value="ru"> Русский </option>
          </select>
        </div>
      </header>
      <div className="mt-10">
        <div className="grid sm:grid-cols-1 sm:p-3 lg:grid-cols-3 gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            
            <SortableContext items={containers.map((i) => i.id)}>
              {containers.map((container) => (
                <Container
                  id={container.id}
                  title={container.title}
                  key={container.id}
                  onAddItem={() => {
                    setShowAddItemModal(true);
                    setCurrentContainerId(container.id);
                  }}
                  handleRemove = {handleRemove}
                  tasks = {container.items}
                />
      
              ))}
            </SortableContext>            
            
            <DragOverlay adjustScale={false}>
              {/* Drag Overlay For item Item */}
              {activeId && activeId.toString().includes('item') && (
                <Items id={activeId} task={findItem(activeId)}/>
              )}
            </DragOverlay>
          </DndContext>
          
        </div>
      </div>
      
    </div>
  );
}
